---
title: LLM-as-judge for bash commands
slug: llm-as-judge
category: approval-gate
event: PreToolUse
trust: theoretical
description: Sends every bash command Claude wants to run to a second LLM for safety classification before allowing execution.
matcher: "Bash"
hook_type: command
tags: [approval-gate, llm-judge, safety, bash, ai-reviewing-ai]
source: dyad.sh — AI-powered permission hooks
source_url: https://www.dyad.sh/blog/claude-code-permission-hooks
related_events: [PreToolUse]
related_recipes: [air-gap-mode]
viral: true
---

Before Claude executes any bash command, this hook sends the command to a second LLM (Claude Haiku, for speed and cost) and asks it to classify whether the command is safe. If the judge deems it risky, the command is blocked and Claude is told why. This is AI reviewing AI — a second model as an independent safety layer.

This pattern is marked **theoretical** because it requires a working Python script and API key, adds non-trivial latency and cost per command, and the judge's accuracy depends on its prompt. It's a reference architecture, not a drop-in snippet.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cat | python3 ~/.claude/hooks/llm-judge.py",
            "timeout": 15
          }
        ]
      }
    ]
  }
}
```

The `llm-judge.py` script (install at `~/.claude/hooks/llm-judge.py`):

```python
#!/usr/bin/env python3
import json, sys, os
import urllib.request

payload = json.load(sys.stdin)
command = payload.get("tool_input", {}).get("command", "")

prompt = f"""You are a shell command safety judge. Classify this command as SAFE or RISKY.

Command: {command}

RISKY means: deletes files outside /tmp, drops databases, exfiltrates data, modifies system files, runs curl|sh patterns, or creates fork bombs.
SAFE means: reads files, runs tests, compiles code, installs packages, runs git operations.

Respond with exactly one word: SAFE or RISKY. Then a newline. Then one sentence explaining why."""

request_body = json.dumps({
    "model": "claude-haiku-4-5",
    "max_tokens": 64,
    "messages": [{"role": "user", "content": prompt}]
}).encode()

req = urllib.request.Request(
    "https://api.anthropic.com/v1/messages",
    data=request_body,
    headers={
        "x-api-key": os.environ.get("ANTHROPIC_API_KEY", ""),
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
    }
)

try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        result = json.loads(resp.read())
        verdict = result["content"][0]["text"].strip()
        if verdict.upper().startswith("RISKY"):
            print(f"LLM judge blocked command: {verdict}", file=sys.stderr)
            sys.exit(2)
        sys.exit(0)
except Exception as e:
    # Fail open: if the judge errors, allow the command
    sys.exit(0)
```

## Why it works

The hook pipes the full hook payload (including the pending command) to the Python script via stdin. The script calls the Anthropic API with a structured classification prompt and exits 2 if the verdict is RISKY, which blocks the command and returns the judge's reasoning to Claude as an error message. Claude then has the opportunity to explain why the command is actually safe, or to propose an alternative.

Failing open (exiting 0 on API error) is an intentional design choice: a network hiccup or rate limit shouldn't lock Claude in a blocked state mid-session.

## Gotchas

- **Latency**: Each blocked or analyzed command adds a round-trip to the Anthropic API (~300-800ms). This is acceptable for rare high-risk operations but painful for rapid iteration with many bash calls. Consider scoping the matcher to higher-risk patterns only.
- **Cost**: Claude Haiku at roughly $0.25/MTok input means thousands of classifications are sub-cent, but agentic loops can still accumulate.
- **ANTHROPIC_API_KEY** must be set in the environment. Inject it via a `SessionStart` hook that writes to `$CLAUDE_ENV_FILE`, or set it in your shell profile.
- **Judge accuracy** depends on the prompt and model. The judge can be fooled by obfuscated commands. This is a speed bump, not a security guarantee.
- The script fails open on timeout or API error. To fail closed instead, change the `except` block to `sys.exit(2)` — but beware of locking yourself out during API outages.
