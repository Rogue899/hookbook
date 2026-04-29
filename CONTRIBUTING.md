# Contributing to hookbook.dev

Thanks for considering a contribution. Here's how it works.

## Submitting a recipe

1. Fork the repo.
2. Add your markdown file under `src/content/recipes/<category>/<slug>.md`.
3. Use kebab-case for the slug (matches the URL).
4. Required frontmatter:

```yaml
---
title: <human-readable title>
slug: <kebab-case>
category: <one of: git, format, quality-gate, anti-loop, context-load, observability, approval-gate, notification>
event: <one of the hook events>
trust: <claim whatever — CI will downgrade to experimental on merge>
description: <20-160 chars, used for cards and meta>
---
```

5. Body should include:
   - The hook JSON snippet in a fenced code block
   - "Why it works" explanation
   - "Gotchas" if any
   - Source attribution if from-source

6. Open a PR. CI will:
   - Validate frontmatter against the Zod schema
   - Run unit tests
   - Run Lighthouse (perf budget enforced)
   - Auto-downgrade your trust label to `experimental`

## Promotion to `tested`

The maintainer promotes recipes to `tested` only after running them in real workflow. This is intentional — it's the moat.

## Reporting bugs

Open an issue using the bug-report template.

## Requesting an event reference page

Open an issue using the event-reference-request template.

## License

By contributing, you agree your contribution is MIT-licensed.
