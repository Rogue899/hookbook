---
title: "Mistaking warnings for blocks in CI"
slug: mistaking-warning-for-block
severity: low
description: "Hooks that exit 1 produce warnings in Claude's output but don't actually prevent anything. CI pipelines that grep for these warnings may misinterpret them."
related_events: [PreToolUse, PostToolUse, Stop]
---

Exit code 1 hooks produce warning messages in Claude's conversation output. If you're monitoring Claude Code sessions in CI (log scraping, output parsing), you might see these warnings and assume something was blocked.

## The confusion

- Exit 1 warning: "⚠️ Large file detected (>10MB)" — Claude proceeds anyway
- Exit 2 block: "🚫 Blocked: writes to main branch not allowed" — Claude cannot proceed

Both show up in session logs. Only exit 2 actually prevents the action.

## When this matters

- CI pipelines that parse Claude Code output for "error" or "warning" keywords
- Monitoring dashboards that count hook activations
- Team members reading session transcripts who assume every warning was enforced

## Fix

If you need to know whether an action was actually blocked, check the hook's exit code in your logging, not the output text. Or better: use exit 2 for things that must be blocked, and exit 0 (with stdout info) for things that are just informational.
