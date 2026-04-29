---
name: PreToolUse
description: Fires before Claude executes any tool call. The primary hook surface for approval gates, safety guards, and input validation.
when_fires: After Claude decides to call a tool but before the tool executes. Fires once per tool call attempt.
payload_fields:
  - "session_id (string)"
  - "tool_name (string — e.g., 'Bash', 'Write', 'Edit', 'Read')"
  - "tool_input (object — the full input parameters)"
common_matchers:
  - "Bash"
  - "Write"
  - "Edit"
  - "Write|Edit"
  - "Read"
gotchas:
  - "Exit code 1 is a WARNING, not a block. Use exit code 2 to actually prevent the tool call."
  - "Matcher is a regex against tool_name — 'Write' matches Write but not 'Edit'. Use 'Write|Edit' for both."
  - "Empty matcher matches ALL tool calls — powerful but noisy."
  - "The tool_input object structure varies per tool. Read the Anthropic docs for each tool's schema."
---

PreToolUse is the workhorse of Claude Code hooks. It's where you build approval gates (require human confirmation for destructive commands), safety guards (block rm -rf, protect main branch), and quality checks (typecheck before commit).

The exit code semantics are critical and the #1 source of bugs: exit 0 = proceed, exit 1 = warn but proceed, exit 2 = block and feed stderr back to Claude.
