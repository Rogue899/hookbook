# Credits & Acknowledgments

Hookbook would not exist without the work of others. This page makes the lineage explicit.

## Claude Code itself

Hookbook is a reference site for a feature shipped by [Anthropic](https://anthropic.com)'s Claude Code team. The hook system documented here is theirs; this site only organizes recipes, points to pitfalls, and stays out of the way of the official docs.

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — the tool itself
- [Official hooks documentation](https://docs.anthropic.com/en/docs/claude-code/hooks) — the source of truth
- [Anthropic Engineering blog on hooks](https://www.anthropic.com/engineering/claude-code-hooks) — the design intent

When the official docs and a recipe here disagree, the official docs win. Open an issue and we'll fix the recipe.

## Patterns and prior art

- **Boris Cherny** ([@bcherny](https://github.com/bcherny)) — Head of Claude Code at Anthropic. Several patterns documented here (the Stop-hook keep-going trigger, the build-gate-on-stop recipe, agent profiles with loud failure surfacing, "now update CLAUDE.md" as the correction loop) trace back to publicly shared workflows from his community presence and reverse-engineered configs.
- **Andrej Karpathy** ([@karpathy](https://github.com/karpathy)) — the [LLM-wiki gist](https://gist.github.com/karpathy/) inspired the editorial structure: raw sources → curated wiki → schema-defined pages, with the LLM doing the bookkeeping humans abandon.
- **The Claude Code community** — every recipe with the `from-source 🔵` label points to its upstream author. The `tested 🟢` and `experimental 🟡` ones started as community patterns we then verified or stress-tested ourselves.

## Tools

- [Astro](https://astro.build) — the static site generator
- [Svelte](https://svelte.dev) — interactive components (Search, FilterBar, MobileMenu, TrustBadge)
- [Tailwind CSS](https://tailwindcss.com) — utility styling
- [Pagefind](https://pagefind.app) — static-site search index
- [Geist](https://vercel.com/font) and [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) — typography
- [Cloudflare Pages](https://pages.cloudflare.com) — hosting
- [GitHub Actions](https://github.com/features/actions) — CI/CD

## Approach

The site's first content pass was seeded from a research note: an enumeration of Claude Code hook events, common community patterns, and documented pitfalls. That seed was then human-curated, fact-checked against the official docs, and labeled with the trust system you see on every recipe and event page. The curation process is documented in [METHODOLOGY](/methodology).

Trust labels exist because the alternative — implying everything is "official" or "production-ready" when most of the ecosystem is still figuring it out — would mislead readers. Honesty is the editorial spine.

## Want to be on this page?

If you authored a recipe or pitfall pattern that's documented here without attribution, [open an issue](https://github.com/Rogue899/hookbook/issues) or PR and we'll add the credit. The same goes for any factual error — we'd rather fix it than save face.

## License & attribution norms

The site code is open source (see the repo). Recipes are CC-BY-4.0 unless explicitly marked otherwise — attribute back to the upstream author when one is named, and to hookbook.dev when the recipe was authored here.
