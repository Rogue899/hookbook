---
title: Multi-stack format router
slug: multi-stack-format-router
category: format
event: PostToolUse
trust: experimental
description: Routes each file Claude writes to its native formatter — Prettier for JS/TS, Black for Python, gofmt for Go, rustfmt for Rust.
matcher: "Write|Edit"
hook_type: command
tags: [format, prettier, black, gofmt, rustfmt, multi-language, polyglot]
source: Seed library (fmt-04 pattern + community composition)
source_url: https://blakecrosley.com/blog/claude-code-hooks-tutorial
related_events: []
related_recipes: [prettier-on-write]
---

Polyglot repositories need a routing layer: a Python file should go to Black, a Go file to `gofmt`, a Rust file to `rustfmt`, and JS/TS/JSON/CSS to Prettier. This hook is a single shell one-liner that uses file extension matching to dispatch to the right formatter — no separate hooks per language.

The pattern is marked **experimental** because the `case` statement is shell-dependent and needs adaptation for Windows (use `if/elif` chains or WSL). Verify each formatter is installed before enabling.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(jq -r '.tool_input.file_path'); EXT=\"${FILE##*.}\"; case \"$EXT\" in js|ts|jsx|tsx|json|css|scss|html|md) npx prettier --write \"$FILE\" 2>/dev/null || true ;; py) black \"$FILE\" 2>/dev/null || true ;; go) gofmt -w \"$FILE\" 2>/dev/null || true ;; rs) rustfmt \"$FILE\" 2>/dev/null || true ;; esac"
          }
        ]
      }
    ]
  }
}
```

## Why it works

The extension-based `case` dispatch maps directly to formatter conventions: Go requires `gofmt` (not Prettier), Rust requires `rustfmt`, and Python's Black has intentionally different opinions from Prettier. By routing at the hook level rather than configuring Prettier plugins, you use the canonical toolchain for each language — the same tool CI uses — which means fewer "format wars" between Claude and your linter.

The `||true` on every branch ensures a missing formatter (e.g., `rustfmt` not installed) silently passes rather than blocking Claude.

## Gotchas

- **Each formatter must be on `PATH`** for its branch to work. Missing ones silently skip. Run `which black`, `which gofmt`, `which rustfmt` to verify before enabling.
- The extension extraction (`${FILE##*.}`) is POSIX shell — works in bash/zsh/sh. On Windows, set `"shell": "bash"` explicitly in the hook config or rewrite as a `node` script.
- Black's default line length (88) may conflict with existing project style. Use `black --line-length 79 "$FILE"` or a `pyproject.toml` to override.
- This is a denylist approach for extensions: unlisted extensions are silently ignored, which is usually correct for binary files, lock files, etc.
- `gofmt -w` formats the file in place but does not enforce Go module conventions. For stricter Go linting, replace with `goimports -w "$FILE"`.
