---
title: WIP commit on stop
slug: wip-commit-on-stop
category: git
event: Stop
trust: from-source
description: Auto-creates a WIP checkpoint commit every time Claude finishes a turn, so you can always roll back.
hook_type: command
tags: [git, commit, checkpoint, workflow]
source: Boris Cherny's Claude Code config (bcherny)
source_url: https://github.com/bcherny
related_events: [PostToolUse]
related_recipes: [auto-stage-on-write]
---

When Claude finishes responding, this `Stop` hook commits everything staged at that moment with a `wip [claude]` message. Combined with `auto-stage-on-write`, you get automatic checkpoint commits after every Claude turn — a reversible breadcrumb trail through the entire session.

Boris Cherny (a TypeScript core contributor who open-sources his Claude Code config) uses a variant of this pattern to keep his agentic sessions fully recoverable without manual ceremony.

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "cd \"$CLAUDE_PROJECT_DIR\" && git add -A && git diff-index --quiet HEAD || git commit -m \"wip [claude]\" 2>/dev/null || true",
            "async": true
          }
        ]
      }
    ]
  }
}
```

## Why it works

The `git diff-index --quiet HEAD` check is the critical piece: it exits non-zero only when there are staged changes, which means the `git commit` only runs when there's something to commit. This prevents a flood of empty `wip [claude]` commits on turns where Claude didn't touch any files.

`"async": true` is set deliberately — the commit runs in the background so it doesn't add latency to Claude's stop time. The commit still happens; Claude just doesn't wait for it.

## Gotchas

- This uses `git add -A` to stage everything before committing. If you want surgical staging, use the `auto-stage-on-write` hook in `PostToolUse` and remove `git add -A` from this command — the staged files will already be correct.
- WIP commits accumulate fast in long sessions. Before pushing, consider `git rebase -i` to squash them into meaningful commits.
- The `Stop` event fires on every turn end, including turns where Claude only answered a question and wrote nothing. The `diff-index` guard handles this gracefully.
- If you use a pre-commit hook that runs tests or lint, those will also fire on every WIP commit. Consider using `--no-verify` in the command if that's too slow — but be deliberate about it.
