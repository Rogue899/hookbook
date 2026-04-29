---
title: "Silently failing formatters — edits that disappear"
slug: silently-failing-formatters
severity: medium
description: "PostToolUse formatters that crash silently (via || true) can corrupt files or lose changes without any visible error."
related_events: [PostToolUse]
---

A common pattern in PostToolUse hooks is running a formatter with `|| true` to prevent hook failures from blocking Claude:

```bash
npx prettier --write "$FILE" 2>/dev/null || true
```

This looks safe. But if Prettier crashes mid-write (out of memory, invalid syntax, missing parser), the file may be left in a corrupted state — and the `|| true` means nobody notices.

## Symptoms

- Claude writes valid code, but the next read shows garbled or truncated content
- Tests fail on syntax errors in files Claude just wrote correctly
- The formatter works on small files but silently fails on large ones

## Better pattern

```bash
FILE=$(jq -r '.tool_input.file_path')
if npx prettier --check "$FILE" 2>/dev/null; then
  npx prettier --write "$FILE"
else
  echo "Prettier would change $FILE but check failed — skipping" >&2
fi
exit 0  # Never block on format failures
```

## The rule

Never suppress formatter errors completely. Log them or skip the format — don't let a half-finished write corrupt your files.
