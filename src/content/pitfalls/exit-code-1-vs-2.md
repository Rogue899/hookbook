---
title: "Exit code 1 vs 2 — your hook isn't blocking"
slug: exit-code-1-vs-2
severity: high
description: "Exit code 1 is a warning (non-blocking). Exit code 2 actually blocks. Most community hooks get this wrong and silently fail to enforce their rule."
related_events: [PreToolUse, Stop]
---

The single most common bug in community hooks: people set `exit 1` thinking it'll block Claude from running a command, when in fact it just emits a warning and proceeds.

## What the docs say

| Exit code | Behavior |
|---|---|
| **0** | Hook succeeded. Continue. |
| **1** | Hook reported a warning. **Continue anyway.** Output goes to stderr. |
| **2** | Hook blocked the action. Tool call refused. Output is fed back to Claude. |

## Symptom

You wrote a `PreToolUse` hook to refuse `Bash` commands matching `rm -rf /`. The hook runs, prints "blocked!", but the command still executes. You assume the matcher is wrong. It isn't — your hook is exiting 1.

## Fix

```bash
if [[ "$CLAUDE_TOOL_INPUT" =~ rm[[:space:]]+-rf[[:space:]]+/ ]]; then
  echo "Refused: dangerous rm" >&2
  exit 2  # not 1
fi
exit 0
```

## Why this is everywhere

Most shell scripts use `exit 1` for "something went wrong." That convention is wrong for Claude Code hooks. Hooks have their own semantics: 1 = warn, 2 = block.
