---
name: PreCompact
description: Fires before Claude Code compacts (summarizes) the conversation to free context window space. Enables context preservation and compaction logging.
when_fires: When the conversation approaches the context limit and Claude Code decides to compact. Fires before the compaction happens.
payload_fields:
  - "session_id (string)"
  - "transcript_length (number — current token count)"
common_matchers:
  - "(empty — matches all compaction events)"
gotchas:
  - "Relatively rare event — only fires when context window is nearly full."
  - "Cannot prevent compaction (exit code 2 does not block it). Use this for logging, not gating."
  - "Useful for saving the full transcript before compaction truncates it."
---

PreCompact fires when Claude Code is about to summarize and truncate the conversation history. This is a relatively advanced hook — most users never encounter it because they don't hit context limits in normal sessions.

The primary use case is observability: log the full transcript before compaction so you have an audit trail of what was discussed. Some teams use it to checkpoint work state (save TODO lists, file change summaries) before the context is compressed.
