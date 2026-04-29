---
name: PostToolUseFailure
description: Fires after a tool call fails. Enables error logging, retry logic suggestions, and failure-specific automation.
when_fires: After a tool call returns a non-zero exit code or throws an error. Does NOT fire on success.
payload_fields:
  - "session_id (string)"
  - "tool_name (string)"
  - "tool_input (object)"
  - "error (string — the error message)"
common_matchers:
  - "Bash"
  - "Write|Edit"
gotchas:
  - "Less commonly used than PostToolUse — most automation targets success, not failure."
  - "Don't create retry loops from failure hooks — that's an anti-pattern that can cascade."
  - "Useful for observability: log failures to understand what Claude struggles with."
---

PostToolUseFailure is the error-path counterpart to PostToolUse. Most teams use it for observability — logging which tool calls fail and why — rather than for automated recovery.

The most practical use: append failed commands to a log file for later debugging, especially for Bash commands that fail due to missing dependencies or permission issues.
