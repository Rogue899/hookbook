module.exports = {
  ci: {
    collect: { staticDistDir: './dist', numberOfRuns: 3 },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        // SEO as warn (not error) — pages with intentional noindex (404, future
        // internal-only routes) cap Lighthouse SEO at ~0.66 by design. We still
        // want the signal surfaced in run logs, just not as a merge blocker.
        'categories:seo': ['warn', { minScore: 1.0 }],
      },
    },
  },
};
