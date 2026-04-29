---
title: Air-gap mode
slug: air-gap-mode
category: approval-gate
event: PreToolUse
trust: from-source
description: Blocks ALL tool calls when the CLAUDE_AIR_GAPPED env var is set — maximum safety mode for sensitive or offline work.
hook_type: command
tags: [approval-gate, safety, air-gap, offline, containment]
source: Community pattern (smartscope.blog + official docs)
source_url: https://smartscope.blog/en/generative-ai/claude/claude-code-hooks-guide/
related_events: [PreToolUse]
related_recipes: [llm-as-judge, protect-secrets]
viral: true
---

Set `CLAUDE_AIR_GAPPED=1` in your environment and Claude is immediately locked to conversation-only mode: no file reads, no file writes, no bash commands, no web fetches — nothing. Unset it and everything returns to normal. This is a single-variable toggle for maximum containment, useful for sensitive planning sessions, public WiFi, or client environments where you don't want any accidental tool use.

The hook uses an empty matcher (`""`) to intercept all `PreToolUse` events regardless of tool name.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "[ \"${CLAUDE_AIR_GAPPED:-0}\" = \"1\" ] && echo \"Air-gap mode active: all tool calls are blocked. Unset CLAUDE_AIR_GAPPED to re-enable tools.\" >&2 && exit 2 || exit 0"
          }
        ]
      }
    ]
  }
}
```

Activate and deactivate from your terminal:

```bash
# Activate air-gap mode
export CLAUDE_AIR_GAPPED=1

# Deactivate
unset CLAUDE_AIR_GAPPED
# or
export CLAUDE_AIR_GAPPED=0
```

## Why it works

`PreToolUse` with an empty matcher fires before every tool call. The hook reads `CLAUDE_AIR_GAPPED` from the environment — which Claude Code inherits from the shell that launched it — and exits 2 if it's set to `1`. Exit 2 blocks the tool call and sends the message to Claude, which will then explain that it can't use tools in this mode.

Because the check is environment-variable-based, toggling air-gap mode doesn't require editing any config files or restarting Claude. It takes effect on the very next tool call.

## Gotchas

- **Claude can still respond, reason, and generate code in conversation** — only tool execution is blocked. Claude can write code in a code block that you copy and run manually, for example.
- The hook does NOT block Claude's internal reasoning or reading what's already in context. It only blocks the tool-execution layer.
- On Windows, environment variable handling works differently in CMD vs PowerShell vs Git Bash. This hook assumes Unix-style `[ ... ]` test syntax — set `"shell": "bash"` in the hook config or use a `.bat` equivalent.
- If you use a `SessionStart` hook that injects env vars via `$CLAUDE_ENV_FILE`, you can set air-gap mode at session start automatically for specific project directories.
- The empty matcher catches all tools including MCP tools. This is usually what you want, but if you need to allow specific read-only MCP tools, add a more specific hook above this one that exits 0 for those tools before this catch-all fires.
