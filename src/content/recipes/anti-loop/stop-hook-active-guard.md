---
title: Stop hook active guard
slug: stop-hook-active-guard
category: anti-loop
event: Stop
trust: from-source
description: Canonical template for preventing infinite Stop hook loops by checking the stop_hook_active flag before any blocking exit.
hook_type: command
tags: [anti-loop, stop, safety, template, quality-gate]
source: Official Claude Code hooks documentation
source_url: https://code.claude.com/docs/en/hooks
related_events: [Stop, SubagentStop]
related_recipes: [typecheck-before-commit]
---

When a `Stop` hook exits with code 2, Claude Code re-runs the agent to fix the reported error — and then fires the `Stop` hook again. Without a guard, this creates an infinite loop: hook fails, Claude tries again, hook fails again, forever. The `stop_hook_active` field in the hook payload is Claude Code's built-in escape hatch for exactly this situation.

This recipe is a **copy-paste template**: add your quality gate logic after the guard, and the loop protection comes for free.

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); ACTIVE=$(echo \"$INPUT\" | jq -r '.stop_hook_active // false'); [ \"$ACTIVE\" = \"true\" ] && exit 0; echo \"[your quality gate logic here — exit 2 to block, exit 0 to allow]\" >&2 && exit 0",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

A real-world example that runs TypeScript typecheck and uses this guard:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(cat); [ \"$(echo \"$INPUT\" | jq -r '.stop_hook_active // false')\" = \"true\" ] && exit 0; ERRORS=$(cd \"$CLAUDE_PROJECT_DIR\" && pnpm -s typecheck 2>&1 | tail -20); [ -n \"$ERRORS\" ] && echo \"TypeScript errors found — fix before stopping:\\n$ERRORS\" >&2 && exit 2 || exit 0",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

## Why it works

When `stop_hook_active` is `true`, it means Claude is already in a hook-triggered retry loop. The guard detects this and exits 0 immediately — letting Claude stop cleanly even if the quality gate would normally fail. This prevents the infinite loop while still enforcing the gate on normal (non-loop) stop events.

The `timeout` field is equally important: it kills the quality check if it hangs, preventing Claude from waiting forever. The default hook timeout is 600 seconds; always set an explicit shorter timeout on Stop hooks.

## Gotchas

- **Every Stop hook that can exit 2 MUST include this guard.** Without it, you will create an infinite loop. This is the single most common mistake with quality-gate hooks.
- The guard must appear at the top of the command, before any logic that might exit 2.
- `stop_hook_active` is `false` (string) when Claude is stopping normally. The `// false` in the `jq` expression handles the case where the field is absent.
- Exit code 1 is a non-blocking warning — it logs a message but does not re-trigger Claude. If you want to surface information without looping, use exit 1 instead of exit 2.
- The flag is set per-stop-event, not per-session. Each turn gets its own loop detection.
