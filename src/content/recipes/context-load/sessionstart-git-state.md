---
title: Inject git state at session start
slug: sessionstart-git-state
category: context-load
event: SessionStart
trust: from-source
description: Injects current git branch, status, and recent commits into Claude's context at the start of every session.
hook_type: command
tags: [context-load, git, session-start, productivity]
source: claudefa.st — Session lifecycle hooks
source_url: https://claudefa.st/blog/tools/hooks/session-lifecycle-hooks
related_events: [SessionStart]
related_recipes: [auto-stage-on-write]
---

At the start of every Claude session, this hook runs `git branch`, `git status`, and `git log` in the project directory and injects the results as `additionalContext` — a special JSON output format that Claude Code inserts directly into the system prompt. Claude immediately knows what branch you're on, what files are modified, and what was recently committed, without you typing a word.

This eliminates the ritual of "we're on branch `feature/auth`, there's a modified `src/auth.ts`, and the last commit was..." at the start of every session.

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "python3 -c \"import subprocess,json,sys; b=subprocess.run(['git','branch','--show-current'],capture_output=True,text=True,cwd='$CLAUDE_PROJECT_DIR').stdout.strip(); s=subprocess.run(['git','status','--short'],capture_output=True,text=True,cwd='$CLAUDE_PROJECT_DIR').stdout.strip(); l=subprocess.run(['git','log','--oneline','-5'],capture_output=True,text=True,cwd='$CLAUDE_PROJECT_DIR').stdout.strip(); ctx='Branch: '+b+'\\nStatus:\\n'+s+'\\nRecent commits:\\n'+l; print(json.dumps({'hookSpecificOutput':{'hookEventName':'SessionStart','additionalContext':ctx}}))\" 2>/dev/null || echo '{}'"
          }
        ]
      }
    ]
  }
}
```

## Why it works

`SessionStart` hooks can output a special JSON structure to stdout that Claude Code reads before the first user message. The `additionalContext` field gets prepended to Claude's context for the session. Unlike putting this in `CLAUDE.md`, it's dynamic — it reflects the actual current state of the repository at the moment you start the session.

Python is used here rather than a shell one-liner because it handles the JSON serialization safely (no shell escaping bugs with branch names or commit messages that contain quotes or special characters).

## Gotchas

- `additionalContext` is capped at **10,000 characters** by Claude Code. Large `git status` outputs (many modified files) or verbose `git log` outputs may be truncated. The hook includes only the last 5 commits and short status to stay well within the cap.
- The hook silently fails (`|| echo '{}'`) if python3 is not available or if the directory is not a git repository. This is intentional — a failed context-load hook shouldn't block your session.
- `$CLAUDE_PROJECT_DIR` must be set for the `cwd` parameter to resolve correctly. This environment variable is automatically set by Claude Code to the project root.
- If you prefer a shell-only version without Python, replace the JSON output with a plain `echo` — plain stdout from `SessionStart` hooks is also injected as context, though less structured.
