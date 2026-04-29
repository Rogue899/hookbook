---
title: Mobile push via ntfy.sh
slug: mobile-push-ntfy
category: notification
event: Stop
trust: from-source
description: Sends a push notification to your phone via ntfy.sh when Claude finishes a turn — works on any platform with no app install required on the server.
hook_type: command
tags: [notification, mobile, ntfy, push, cross-platform, phone]
source: DEV.to — Mobile approval system for Claude Code
source_url: https://dev.to/coa00/how-i-built-a-mobile-approval-system-for-claude-code-so-i-can-finally-leave-my-desk-1ida
related_events: [Stop]
related_recipes: [stop-hook-active-guard]
viral: true
---

When Claude finishes a turn, this hook fires a push notification to your phone via [ntfy.sh](https://ntfy.sh) — a free, open-source pub/sub push service. You can walk away from your computer during long Claude sessions and know the moment it's done. No app to install on the server, no account required for public topics, and it works on macOS, Linux, and Windows without any platform-specific code.

Install the ntfy app on your phone (iOS or Android), subscribe to your personal topic, and you're set.

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "curl -s -d 'Claude finished a task in $CLAUDE_PROJECT_DIR' -H 'Title: Claude Code' -H 'Priority: default' -H 'Tags: white_check_mark' https://ntfy.sh/YOUR_TOPIC_ID &",
            "async": true
          }
        ]
      }
    ]
  }
}
```

Replace `YOUR_TOPIC_ID` with a unique, hard-to-guess string (e.g., `claude-tarek-f8x2k9`). Anyone who knows your topic ID can receive your notifications, so treat it like a password.

For a richer notification that includes the last message Claude sent:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "SUMMARY=$(cat | jq -r '.stop_reason // \"Task complete\"' | head -c 100); curl -s -d \"Claude finished: $SUMMARY\" -H 'Title: Claude Code Done' -H 'Priority: default' -H 'Tags: robot' https://ntfy.sh/YOUR_TOPIC_ID &",
            "async": true
          }
        ]
      }
    ]
  }
}
```

## Why it works

ntfy.sh is a simple HTTP pub/sub service: you `curl -d "message" https://ntfy.sh/your-topic`, the ntfy app on your phone receives it instantly. No authentication required for public topics, no SDK, no API key. The `&` at the end of the curl command (or `"async": true` on the hook) ensures the notification fires in the background without blocking Claude's stop sequence.

The `Stop` event fires at the end of every turn — including turns where Claude finishes normally and turns where a Stop hook triggered a retry. Unlike platform-specific solutions (macOS `osascript`, Windows BurntToast), `curl` to ntfy.sh works identically everywhere.

## Gotchas

- **Topic ID privacy**: ntfy.sh public topics are readable by anyone who knows the topic name. Use a long random string (not your name or project name) as the topic ID. For private topics, use ntfy.sh's paid tier or self-host ntfy.
- **curl must be on PATH**. It's pre-installed on macOS 10.x+, most Linux distros, and Windows 10 1803+. On older Windows, install via `winget install curl.curl`.
- The `Stop` event fires on every turn end, not just when Claude completes a long task. You may get a lot of notifications during rapid back-and-forth iteration. Consider adding a session duration check to only notify if the turn took more than N seconds.
- If you want to use ntfy for **approval gates** (approve/deny actions from your phone), that requires a more complex setup — see the `ag-01` pattern in the seed library for the bidirectional ntfy approval flow.
- Self-hosting ntfy (via Docker: `docker run -p 80:80 binwiederhier/ntfy serve`) gives you private topics and full control. The command remains identical — just change the domain.
