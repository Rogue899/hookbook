---
title: Auto-stage on write
slug: auto-stage-on-write
category: git
event: PostToolUse
trust: from-source
description: Stages the exact file Claude just wrote with git add — no unrelated files, no noise.
matcher: "Write|Edit"
hook_type: command
tags: [git, staging, workflow]
source: karanb192/claude-code-hooks
source_url: https://github.com/karanb192/claude-code-hooks
related_events: [PreToolUse]
related_recipes: [wip-commit-on-stop]
---

Every time Claude writes or edits a file, this hook immediately runs `git add` on that exact path. You get a clean, surgical staging area that tracks only what Claude touched — not a `git add -A` blast that picks up unrelated edits you were making in another terminal.

It reads the file path straight from the hook payload via `jq`, so there's no glob expansion or accidental over-staging.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "cd \"$CLAUDE_PROJECT_DIR\" && FILE=$(jq -r '.tool_input.file_path // empty') && git add \"$FILE\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

## Why it works

Claude's hook payload always includes `tool_input.file_path` for `Write` and `Edit` operations. The `jq -r '.tool_input.file_path // empty'` extracts it cleanly, falling back to empty string (and therefore a no-op `git add ""`) if the field is absent. The `|| true` at the end ensures the hook exits 0 even if git isn't initialized, so Claude's workflow is never interrupted.

Pairing this with `wip-commit-on-stop` gives you a two-phase checkpoint system: stage on every write, commit when Claude finishes the turn.

## Gotchas

- `jq` must be installed and on `PATH`. On most macOS and Linux systems it's available; on Windows you may need to install it via `winget install jqlang.jq` or set `"shell": "bash"` if using Git Bash.
- The hook runs synchronously after each write. In projects with many rapid file writes (e.g., scaffold generation), you may prefer `"async": true` to avoid any perceptible delay.
- If the project is not a git repository, `git add` silently fails. That's fine — the `|| true` handles it.
