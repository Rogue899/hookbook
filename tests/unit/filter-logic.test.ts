import { describe, it, expect } from 'vitest';
import { filterRecipes, type RecipeRow } from '../../src/lib/filter-recipes';

const fixtures: RecipeRow[] = [
  { slug: 'a', title: 'Auto-format on Write', category: 'format', event: 'PostToolUse', trust: 'tested', description: 'Run Prettier after edits.' },
  { slug: 'b', title: 'Block writes to main', category: 'git', event: 'PreToolUse', trust: 'experimental', description: 'Refuse direct main commits.' },
  { slug: 'c', title: 'Anti-loop guard', category: 'anti-loop', event: 'Stop', trust: 'from-source', description: 'Use stop_hook_active.' },
];

describe('filterRecipes', () => {
  it('returns all when no filters', () => {
    expect(filterRecipes(fixtures, {})).toHaveLength(3);
  });

  it('filters by category', () => {
    const r = filterRecipes(fixtures, { category: 'git' });
    expect(r).toHaveLength(1);
    expect(r[0].slug).toBe('b');
  });

  it('filters by trust', () => {
    const r = filterRecipes(fixtures, { trust: 'tested' });
    expect(r).toHaveLength(1);
    expect(r[0].slug).toBe('a');
  });

  it('filters by event', () => {
    const r = filterRecipes(fixtures, { event: 'Stop' });
    expect(r).toHaveLength(1);
    expect(r[0].slug).toBe('c');
  });

  it('filters by query against title and description', () => {
    expect(filterRecipes(fixtures, { query: 'prettier' })).toHaveLength(1);
    expect(filterRecipes(fixtures, { query: 'main' })).toHaveLength(1);
    expect(filterRecipes(fixtures, { query: 'nonexistent' })).toHaveLength(0);
  });

  it('combines filters', () => {
    const r = filterRecipes(fixtures, { category: 'format', trust: 'tested' });
    expect(r).toHaveLength(1);
    expect(r[0].slug).toBe('a');
  });

  it('treats "all" as no filter', () => {
    expect(filterRecipes(fixtures, { category: 'all', trust: 'all' })).toHaveLength(3);
  });
});
