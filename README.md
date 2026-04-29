# hookbook.dev

> A curated, honestly-labeled cookbook for Claude Code hooks. 29 events. Trust labels. No overclaiming.

**Live site:** [hookbook.dev](https://hookbook.dev)

## What this is

Anthropic documents 29 hook events for Claude Code. Most tutorials cover 6 to 8. The other ~21 are nearly invisible in public content.

This repo is a curated reference closing that gap. Every recipe carries a trust label:

- 🟢 **Tested** — run in production by the maintainer
- 🟡 **Experimental** — installed but not yet proven under real load
- 🔵 **From source** — verbatim from official docs / Boris Cherny's repo / cited community source
- ⚠️ **Theoretical** — should work per docs, not yet tested

## Browse

- [All recipes](https://hookbook.dev/recipes/) — filterable by category, trust, event
- [Event reference](https://hookbook.dev/events/) — all 29 hook events documented
- [Common pitfalls](https://hookbook.dev/pitfalls/) — mistakes everyone makes
- [Methodology](https://hookbook.dev/methodology/) — how trust labels work
- [Changelog](https://hookbook.dev/changelog/) — trust-tier promotions + site updates

## Contributing

PRs welcome. Incoming recipes are auto-downgraded to `experimental` regardless of declared trust. The maintainer promotes to `tested` after personal verification.

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Stack

[Astro](https://astro.build) + [Svelte](https://svelte.dev) + TypeScript strict + [Tailwind CSS](https://tailwindcss.com), deployed to [Cloudflare Pages](https://pages.cloudflare.com).

## Local development

```bash
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # production build + Pagefind search index
pnpm test       # Vitest unit tests
pnpm preview    # preview production build locally
```

## License

MIT.
