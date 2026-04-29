---
title: Protect secrets on write
slug: protect-secrets
category: quality-gate
event: PreToolUse
trust: from-source
description: Blocks Claude from writing files that contain API keys, tokens, or password patterns detected by regex.
matcher: "Write|Edit"
hook_type: command
tags: [quality-gate, security, secrets, api-keys, tokens]
source: karanb192/claude-code-hooks
source_url: https://github.com/karanb192/claude-code-hooks
related_events: []
related_recipes: [typecheck-before-commit]
---

Before Claude writes or edits any file, this hook scans the proposed file content for patterns that look like secrets: API keys, tokens, passwords, private keys, and common secret variable names. If a match is found, the write is blocked and Claude is told to remove the secret before proceeding.

This is a defense-in-depth measure — it catches cases where Claude might echo a secret back into a file from conversation context, a template it's filling in, or a test fixture.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); CONTENT=$(echo \"$INPUT\" | jq -r '.tool_input.new_content // .tool_input.content // empty'); echo \"$CONTENT\" | grep -qiE '(AKIA[A-Z0-9]{16}|sk-[a-zA-Z0-9]{40,}|ghp_[a-zA-Z0-9]{36}|password\\s*=\\s*[\"\\x27][^\"\\x27]{6,}|api[_-]?key\\s*[:=]\\s*[\"\\x27][^\"\\x27]{8,}|-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----)' && echo \"Blocked: file content appears to contain secrets. Remove credentials before writing.\" >&2 && exit 2 || exit 0"
          }
        ]
      }
    ]
  }
}
```

## Why it works

The hook reads the entire proposed file content from the hook payload (`new_content` for Write, `content` for Edit) before the write happens, then runs a regex scan for high-confidence secret patterns:

- `AKIA...` — AWS access key IDs
- `sk-...` — OpenAI API keys (and similar)
- `ghp_...` — GitHub personal access tokens
- `password = "..."` — hardcoded password assignments
- `api_key: "..."` — common config key names
- `-----BEGIN ... PRIVATE KEY-----` — PEM private keys

Exit 2 blocks the write and sends the message to Claude, which will then attempt to strip the secret or replace it with a placeholder.

## Gotchas

- This is a **regex denylist**, not a whitelist. Sophisticated or unusual secret formats will not be caught. Use it as a speed bump alongside `.gitignore` and proper secret management, not as the sole defense.
- The regex may produce false positives on documentation files that discuss secret formats (e.g., a README showing an example key). You can scope the matcher further by checking the file extension in the command.
- The pattern reads content from `jq`-parsed JSON payload. On some platforms, very large files may be truncated in the hook payload. For complete coverage, combine with a pre-commit hook that scans with `gitleaks` or `truffleHog`.
- This hook does NOT scan file paths — only file content. For path-based protection (blocking writes to `.env`, `credentials.json`, etc.), add a separate PreToolUse hook that checks `tool_input.file_path`.
