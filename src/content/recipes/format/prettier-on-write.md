---
title: Prettier on write
slug: prettier-on-write
category: format
event: PostToolUse
trust: from-source
description: Automatically formats any file Claude writes with Prettier, so the output is always clean and consistent.
matcher: "Write|Edit"
hook_type: command
tags: [format, prettier, javascript, typescript, workflow]
source: Official Claude Code hooks guide
source_url: https://code.claude.com/docs/en/hooks-guide
related_events: []
related_recipes: [multi-stack-format-router]
---

Every time Claude writes or edits a file, this hook runs `npx prettier --write` on the exact path. The result is that Claude's output is always formatted to your project's Prettier config before it hits your editor — no manual format step, no `save-on-format` tricks needed.

Prettier's language detection is extension-based, so this single hook handles JS, TS, JSX, TSX, JSON, CSS, SCSS, HTML, Markdown, and more without any per-language configuration.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "FILE=$(jq -r '.tool_input.file_path'); npx prettier --write \"$FILE\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

## Why it works

Claude writes files and then immediately stops — it doesn't re-read the file it just wrote unless you ask. Running Prettier synchronously in the `PostToolUse` hook means the formatted version is on disk before Claude's next read. If Claude reads the file again (to verify, to add something), it sees the already-formatted content, which also prevents it from fighting your formatter on the next turn.

The `2>/dev/null || true` ensures that files Prettier can't parse (binary files, unsupported extensions) silently pass without breaking Claude's flow.

## Gotchas

- `npx prettier` downloads Prettier on first run if it's not in `node_modules`. This causes a noticeable delay for the first file. Fix: add `prettier` to your project's `devDependencies` or install it globally with `npm install -g prettier`.
- If your project has no `.prettierrc` or `prettier.config.js`, Prettier uses its defaults. That may produce diffs if the rest of the codebase uses different formatting. Initialize a Prettier config first.
- This hook runs on every file Claude touches, including generated files, config files, and lock files. Add a `--ignore-unknown` flag if you see errors on non-standard extensions.
- For multi-language projects, see the `multi-stack-format-router` recipe, which routes each extension to its native formatter instead of Prettier.
