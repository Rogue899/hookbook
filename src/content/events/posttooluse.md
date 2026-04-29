---
name: PostToolUse
description: Fires after a tool call completes successfully. The primary hook surface for formatting, staging, logging, and post-action automation.
when_fires: After a tool call returns successfully (exit code 0). Does NOT fire if the tool failed.
payload_fields:
  - "session_id (string)"
  - "tool_name (string)"
  - "tool_input (object)"
  - "tool_result (object — the tool's output)"
common_matchers:
  - "Write|Edit"
  - "Bash"
gotchas:
  - "Runs after EVERY successful tool call matching the matcher — high-frequency. Keep hooks fast."
  - "tool_result may be large (full file contents after Write). Don't blindly log it without size guards."
  - "Async mode ('async': true) is recommended for non-blocking post-actions like formatting and staging."
---

PostToolUse is where most automation lives. After Claude writes a file, you can auto-format it (Prettier, Black, gofmt), stage it in git, log the change, or trigger downstream checks.

The async flag is important: setting `"async": true` lets the hook run without blocking Claude's next action. Use it for non-critical post-processing like logging and formatting.
