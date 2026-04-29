---
name: Stop
description: Fires when Claude completes its turn. The most powerful and dangerous hook surface — enables keep-going loops, end-of-session gates, and auto-commit patterns.
when_fires: After Claude finishes its current response, before the harness yields back to the user. Fires once per turn.
payload_fields:
  - "session_id (string)"
  - "transcript_path (string)"
  - "stop_hook_active (boolean — true if a Stop hook is already running, prevents infinite loops)"
common_matchers:
  - "(empty string — matches all stop events)"
gotchas:
  - "Always check stop_hook_active before exit code 2 — otherwise you create infinite loops."
  - "Exit code 1 = warning (non-blocking). Exit code 2 = block (Claude is told to keep going). Easy to confuse."
  - "Slow Stop hooks delay the next user turn — keep them under 1 second."
---

The Stop hook is the most powerful and dangerous hook surface. It can keep an agent running until tests pass, fail-loudly when work is incomplete, or spam the model into infinite loops if used wrong.

The canonical Boris Cherny pattern: `echo "If there is remaining work, keep going. Check your task list."` printed on every Stop event. Combined with exit code 2 it creates a self-driving loop — but only when guarded by `stop_hook_active`.
