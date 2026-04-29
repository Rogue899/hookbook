---
name: Notification
description: Fires when Claude emits a notification to the user. Enables mobile push, desktop alerts, Slack forwarding, and custom notification routing.
when_fires: When Claude Code generates a notification (e.g., task completion, background agent finishing, error alerts). Frequency depends on session activity.
payload_fields:
  - "session_id (string)"
  - "message (string — the notification text)"
  - "level (string — 'info', 'warning', 'error')"
common_matchers:
  - "(empty — matches all notifications)"
gotchas:
  - "Not all Claude Code events generate Notifications — this is specifically for user-facing alerts."
  - "High-volume sessions can generate many notifications. Rate-limit external integrations."
  - "The ntfy.sh pattern (mobile push) is the most popular community use case."
---

The Notification hook is the bridge between Claude Code and external alerting systems. The most popular pattern is forwarding to ntfy.sh for free mobile push notifications — letting you walk away from your desk and get pinged when Claude finishes a long task.

Other uses: Slack channel posting for team visibility, desktop toast notifications via BurntToast (Windows) or osascript (macOS), and structured logging of all agent communications.
