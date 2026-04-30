# Operations Runbook

Practical procedures for the maintainer. Read before pulling the merge trigger.

---

## Deploy

The deploy fires on every push to `main` via `.github/workflows/deploy.yml`. Pipeline:

1. `pnpm install --frozen-lockfile`
2. `pnpm build` (Astro 6 → `dist/`, then Pagefind index)
3. `cloudflare/wrangler-action` publishes `dist/` to the `hookbook` Cloudflare Pages project

Required secrets on the GitHub repo: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

### Smoke-test the deploy creds before relying on them

If you've never run an end-to-end deploy with the current secrets, do this once before merging anything important:

```bash
# From your workstation, NOT in CI
export CLOUDFLARE_API_TOKEN=<paste-the-secret>
export CLOUDFLARE_ACCOUNT_ID=<paste-the-secret>
pnpm build
npx wrangler pages deploy dist --project-name=hookbook
```

If `wrangler` reports a successful deploy and prints a preview URL, the secrets work and the project name is correct. If it errors, fix the secret/project before merging.

### Preview-deploy validation

Cloudflare Pages auto-creates a preview URL per deployment (e.g. `<commit-sha>.hookbook.pages.dev`). Use it to validate before pointing DNS at the project:

1. Push to `main` (or trigger the workflow manually).
2. Wait for the deploy job to complete (≈2 min).
3. Open the preview URL printed in the workflow logs.
4. Verify: home renders, recipe pages render, search input loads (Pagefind), fonts load, mobile drawer opens, no console errors.
5. Run the Google Rich Results test against the preview URL: <https://search.google.com/test/rich-results>. Confirm `WebSite` and `BreadcrumbList` JSON-LD parse.
6. Only then point `hookbook.dev` DNS at the Pages project.

---

## Rollback

If a merge to `main` produces a broken deploy (visible regression, broken page, JS error), you have three options ordered by speed:

### Option 1 — Revert the merge commit (fastest, cleanest)

```bash
cd c:/Users/TarekRoukoz/Desktop/PRSNL/hookbook
git checkout main
git pull
git revert -m 1 <merge-commit-sha>
git push
```

The revert push triggers a fresh deploy that restores the prior content. ETA: ≈3-4 min from push to live.

### Option 2 — Roll back the Cloudflare Pages deployment directly

Cloudflare Pages keeps the last 20 deployments. In the Pages dashboard:

1. Open the `hookbook` project → Deployments tab.
2. Find the last known-good deployment (green checkmark, prior to the bad one).
3. Click its "..." menu → "Rollback to this deployment."
4. Production routes immediately to the rolled-back deploy. No git changes.

Use this when the issue is a runtime CDN problem rather than a code bug. The git history still shows the bad commit; clean it up afterward with Option 1 if needed.

### Option 3 — Hotfix forward

If the regression is small and obvious (typo, broken link, single bad recipe), push a hotfix commit straight to `main` rather than reverting. Faster than the full revert/PR cycle if you're confident the fix is one line.

```bash
git checkout main
# fix the thing
git add <file>
git commit -m "hotfix: <what>"
git push
```

Don't use this for non-trivial fixes. Use Option 1.

---

## CI gates

`.github/workflows/pr-checks.yml` runs on every PR to `main`. Steps:

1. `pnpm install --frozen-lockfile`
2. `pnpm test` — vitest unit tests (recipe schema + filter logic + trust-gate edge cases)
3. `pnpm build` — Astro build incl. Zod content collection validation (the real schema gate)
4. `pnpm lhci autorun` — Lighthouse CI on perf / a11y / best-practices (hard gates) + SEO (warn only)
5. `node scripts/downgrade-pr-trust.mjs` — rejects PRs that promote recipe trust beyond `experimental`

### Threshold policy (current)

- Performance ≥ 0.85 (real ~0.93)
- Accessibility ≥ 0.95 (real ~0.98)
- Best practices ≥ 0.95
- SEO ≥ 1.0 (warn only — 404 page caps Lighthouse SEO at 0.66 because of intentional `noindex`)

These thresholds are calibrations after observing actual scores on this site. They are NOT permanent — see "Open follow-ups" below for the ratchet plan.

---

## Open follow-ups (file as issues post-launch)

1. **Re-strict SEO to `error` 1.0** with proper per-URL skip on noindex pages via `assertMatrix`. The current `warn` posture surfaces regressions in CI logs but does not block merges. Acceptable for v1 launch; want strict back once we have an `assertMatrix` syntax that actually works against this LHCI version.
2. **Ratchet a11y back to 0.98** and **perf back to 0.92** in 2 weeks once we have a baseline of green runs. Goal: tighten as the site stabilizes, don't let "loosen the gate" calcify.
3. **Conduct email**: replace `t.arek.r94@gmail.com` in `CODE_OF_CONDUCT.md` with `conduct@hookbook.dev` via Cloudflare email routing before any public announcement.
4. **Search.svelte sanitizer**: current implementation is DOMParser-based with `<mark>`-only allowlist, attributes stripped, text re-encoded. If the threat model expands (user-submitted excerpts, third-party sources), swap to DOMPurify with a strict config.
5. **Schema test parity**: `tests/unit/schema.test.ts` mirrors the recipe schema inline. Astro's build-time validation IS the gate; the inline test is supplementary. If they drift, the test catches less than it claims. Refactor by extracting schema into a shared module and importing from both `content.config.ts` and the test.

---

## DNS

`hookbook.dev` is the production domain. Wire-up:

1. Cloudflare DNS dashboard → add `hookbook.dev` and `www.hookbook.dev` as Pages routes.
2. Alternatively: CNAME `www` to `hookbook.pages.dev`, A record (apex) to Cloudflare's Pages anycast IPs.
3. SSL is automatic via Cloudflare.

If DNS isn't pointed yet, the production URL is `<project>.pages.dev` and you can validate everything works there before flipping the apex.

---

## Privacy / observability

- **Plausible** at `data-domain="hookbook.dev"`, gated to `import.meta.env.PROD` so dev sessions don't pollute the dashboard.
- Plausible setup: <https://plausible.io/sites> → Add site → use `hookbook.dev` as the domain.
- Public dashboard URL (optional): set in Plausible → Site settings → Public dashboard. If shared, link from `/about` so visitors can see exactly what we see.
- Privacy disclosure lives at `/privacy/`. Footer links to it.

---

## Maintainer-only commands

```bash
# Dev server
pnpm dev

# Full local validation (mirrors CI)
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm lhci autorun
node scripts/downgrade-pr-trust.mjs

# Promote a recipe from experimental → tested (the only path)
# 1. Edit the recipe file's frontmatter: trust: tested
# 2. Add a tested_on entry: { date, sessions, note }
# 3. Add a changelog entry under src/content/changelog/
# 4. Commit on main directly (this gate is bypassed for direct main commits)
```

---

Last updated 2026-04-30.
