---
name: SessionStart
description: Fires when a new Claude Code session begins or resumes. The entry point for context injection and environment setup hooks.
when_fires: Once at the beginning of every session — both fresh starts and resumed sessions. Fires before any user prompt is processed.
payload_fields:
  - "session_id (string)"
  - "session_type (string — 'new' or 'resume')"
common_matchers:
  - "startup"
  - "resume"
gotchas:
  - "Output is capped at 10,000 characters — large git diffs or file listings will be truncated."
  - "Slow hooks delay the first prompt. Keep SessionStart hooks under 2 seconds."
  - "On resume, Claude already has prior context — injecting duplicate info wastes tokens."
---

SessionStart is the most natural place to inject environmental context: git branch and status, project metadata, team conventions, or TODO lists. Boris Cherny's configuration uses it to load custom instructions and set session-level context.

The key pattern is printing structured JSON to stdout with a `hookSpecificOutput` wrapper, which Claude reads as additional context for the session.
