---
name: UserPromptSubmit
description: Fires after the user submits a prompt but before Claude processes it. Enables input validation, context enrichment, and prompt transformation.
when_fires: After the user presses Enter on their prompt, before the prompt reaches the model. Fires once per user message.
payload_fields:
  - "session_id (string)"
  - "prompt (string — the user's raw input)"
common_matchers:
  - "(empty — matches all prompts)"
gotchas:
  - "Exit code 2 blocks the prompt entirely — the user's message is rejected and never reaches Claude."
  - "Modifying the prompt via stdout is possible but fragile — the format is underdocumented."
  - "Runs synchronously — slow hooks block the user experience."
---

UserPromptSubmit sits between the user and the model. Common uses: auto-appending context to every prompt, validating prompt format for team workflows, or injecting time-sensitive data (current date, on-call status, deploy freeze state).

Use sparingly — this hook fires on every single message. Heavy processing here is felt immediately by the user.
