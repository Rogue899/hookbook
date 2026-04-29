---
title: "Wrong matcher syntax — hooks that never fire"
slug: wrong-matcher-syntax
severity: medium
description: "Matchers are regex patterns against tool_name, not glob patterns. Getting the syntax wrong means your hook silently never fires."
related_events: [PreToolUse, PostToolUse]
---

The `matcher` field in a hook definition is a **regular expression** tested against the tool name (e.g., `Write`, `Edit`, `Bash`, `Read`). It is NOT a glob pattern, not a substring match, and not a file path matcher.

## Common mistakes

| What you wrote | What you meant | What happens |
|---|---|---|
| `*.ts` | Match TypeScript files | Matches nothing — `*` is a regex quantifier, not a glob |
| `write` | Match Write tool | Matches nothing — regex is case-sensitive, tool is `Write` |
| `Write,Edit` | Match Write or Edit | Matches nothing — comma isn't regex OR. Use `Write\|Edit` |
| `Bash(rm)` | Match Bash commands with rm | Matches nothing — matcher tests tool_name, not command content |

## The fix

- Use pipe for OR: `Write|Edit`
- Case matters: `Write` not `write`
- Empty string matches everything: `""` is the catch-all
- To filter by command content, check `tool_input` inside the hook script, not in the matcher
