---
title: Typecheck before commit
slug: typecheck-before-commit
category: quality-gate
event: PreToolUse
trust: experimental
description: Blocks git commit commands if TypeScript typecheck fails, forcing Claude to fix errors before committing.
matcher: "Bash"
hook_type: command
tags: [quality-gate, typescript, typecheck, git, pre-commit]
source: Seed library (qg-01 pattern adapted for PreToolUse)
source_url: https://blog.devgenius.io/claude-code-use-hooks-to-enforce-end-of-turn-quality-gates-5bed84e89a0d
related_events: [Stop]
related_recipes: [protect-secrets]
---

When Claude tries to run a `git commit` command via `Bash`, this hook intercepts it and first runs your project's TypeScript typecheck. If there are type errors, the commit is blocked and the errors are fed back to Claude as an error message — which causes Claude to fix them before retrying.

This is marked **experimental** because the command detection is regex-based (`grep` for `git commit`) and the typecheck command needs to be adapted to your package manager and script name.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "CMD=$(jq -r '.tool_input.command'); echo \"$CMD\" | grep -q 'git commit' && { ERRORS=$(cd \"$CLAUDE_PROJECT_DIR\" && pnpm -s typecheck 2>&1); [ -n \"$ERRORS\" ] && echo \"TypeScript errors must be fixed before committing:\\n$ERRORS\" >&2 && exit 2; }; exit 0"
          }
        ]
      }
    ]
  }
}
```

## Why it works

`PreToolUse` with a `Bash` matcher fires before every shell command Claude runs. The hook reads the pending command from `tool_input.command`, checks if it contains `git commit`, and only then runs the typecheck. This lazy evaluation means the typecheck only runs when a commit is actually attempted — not on every bash invocation.

Exit code 2 (not exit 1) is what blocks the command and returns stderr to Claude as an error message. Exit 1 would be a non-blocking warning. This distinction is the single most common mistake in community quality-gate hooks.

## Gotchas

- Adapt the typecheck command to your stack: `pnpm -s typecheck`, `npm run typecheck`, `yarn tsc --noEmit`, or `npx tsc --noEmit` depending on your project setup.
- The `grep -q 'git commit'` check will also fire on `git commit --amend`. That's usually what you want, but adjust the regex if you need finer control.
- This adds latency to every `git commit` Claude runs. If typecheck takes more than 30 seconds, set `"timeout": 60` on the hook object to prevent it from being killed prematurely.
- For an alternative approach that blocks at turn-end rather than per-commit, see the quality-gate pattern using the `Stop` event with `stop_hook_active` guard in the `stop-hook-active-guard` recipe.
