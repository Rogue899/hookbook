---
title: "Missing stop_hook_active guard — infinite loops"
slug: missing-stop-hook-active-guard
severity: high
description: "Stop hooks that exit 2 without checking stop_hook_active create infinite loops. Claude keeps running, the hook keeps firing, forever."
related_events: [Stop]
---

If your Stop hook exits with code 2, Claude is told "there's more work to do" and continues. When Claude finishes again, the Stop hook fires again. If it exits 2 again... you have an infinite loop.

## The guard

The `stop_hook_active` field in the Stop event payload is `true` when a Stop hook is already running. Always check it:

```bash
#!/bin/bash
STOP_ACTIVE=$(jq -r '.stop_hook_active // false')
if [ "$STOP_ACTIVE" = "true" ]; then
  exit 0  # Break the loop
fi
# Your actual logic here
echo "Check your task list. If there is remaining work, keep going." >&2
exit 2
```

## Why it matters

Without this guard, a single Stop hook can burn through your API quota in minutes. The Claude Code harness does NOT automatically break Stop loops — it's the hook author's responsibility.

## How to detect it

If Claude seems stuck in an endless cycle of "continuing work" with no progress, you're in a Stop loop. Kill the session and add the guard.
