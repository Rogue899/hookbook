module.exports = {
  ci: {
    collect: { staticDistDir: './dist', numberOfRuns: 3 },
    assert: {
      assertMatrix: [
        {
          // 404 has noindex by design — Lighthouse penalizes that as a SEO failure.
          // Keep all other categories strict; skip SEO check on 404 only.
          matchingUrlPattern: '404',
          assertions: {
            'categories:performance': ['error', { minScore: 0.85 }],
            'categories:accessibility': ['error', { minScore: 0.95 }],
            'categories:best-practices': ['error', { minScore: 0.95 }],
            'categories:seo': 'off',
          },
        },
        {
          matchingUrlPattern: '.*',
          assertions: {
            'categories:performance': ['error', { minScore: 0.85 }],
            'categories:accessibility': ['error', { minScore: 0.95 }],
            'categories:best-practices': ['error', { minScore: 0.95 }],
            'categories:seo': ['error', { minScore: 1.0 }],
          },
        },
      ],
    },
  },
};
