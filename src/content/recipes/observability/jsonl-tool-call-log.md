---
title: JSONL tool call audit log
slug: jsonl-tool-call-log
category: observability
event: PostToolUse
trust: experimental
description: Appends one structured JSONL line per tool call to a daily log file, creating a queryable audit trail of everything Claude does.
hook_type: command
tags: [observability, audit, logging, jsonl, debugging]
source: DEV.to — How to see everything Claude Code does
source_url: https://dev.to/boucle2026/how-to-see-everything-claude-code-does-audit-trail-hook-1g9j
related_events: [PostToolUse]
related_recipes: []
---

Every tool call Claude makes — file writes, bash commands, web fetches — gets appended as a single JSON line to a daily log file. The result is a structured, `jq`-queryable audit trail you can replay, search, and analyze after the fact.

This is marked **experimental** because `jq`'s `now|todate` function for timestamps isn't available in all `jq` versions, and the log rotation strategy needs to be set up separately.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "mkdir -p \"$HOME/.claude/session-logs\" && cat | jq -c '{ts: now|todate, event: \"PostToolUse\", tool: .tool_name, file: (.tool_input.file_path // .tool_input.command // \"\"), session: .session_id}' >> \"$HOME/.claude/session-logs/$(date +%Y-%m-%d).jsonl\"",
            "async": true
          }
        ]
      }
    ]
  }
}
```

To query the log after a session:

```bash
# See all files Claude wrote today
jq 'select(.tool == "Write" or .tool == "Edit") | .file' ~/.claude/session-logs/$(date +%Y-%m-%d).jsonl

# See all bash commands in chronological order
jq 'select(.tool == "Bash") | [.ts, .file] | @tsv' ~/.claude/session-logs/$(date +%Y-%m-%d).jsonl

# Count tool calls by type
jq -s 'group_by(.tool) | map({tool: .[0].tool, count: length})' ~/.claude/session-logs/$(date +%Y-%m-%d).jsonl
```

## Why it works

`PostToolUse` fires after every tool call completes, so the log captures confirmed actions rather than intentions. The empty matcher (`""`) means all tools are logged — no filtering. The `jq -c` flag writes compact single-line JSON (the "L" in JSONL), which makes the file append-friendly and line-by-line parseable.

`"async": true` is important here: logging should never add latency to Claude's workflow. The write happens in the background.

## Gotchas

- **Log files grow fast** in long sessions with many file operations. The daily rotation (`$(date +%Y-%m-%d).jsonl`) keeps individual files manageable. Add a cron job or `logrotate` rule to prune files older than 30 days: `find ~/.claude/session-logs -name "*.jsonl" -mtime +30 -delete`.
- `jq`'s `now|todate` requires jq 1.6+. On older systems, replace with `$(date -Iseconds)` via shell and adjust the command structure accordingly.
- The `file` field uses a fallback chain: `file_path` for Write/Edit/Read, `command` for Bash, and empty string for everything else. This means web fetches and MCP tool calls will have an empty `file` field — add `url: (.tool_input.url // "")` to the `jq` object if you want URL logging too.
- If Claude runs thousands of operations in a session, the append pattern can cause I/O contention. This is rare in practice but worth monitoring for very long agentic runs.
