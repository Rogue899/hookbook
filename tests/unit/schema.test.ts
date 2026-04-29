import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Inline mirror of the recipe schema for testing — keep in sync with src/content.config.ts
const trustEnum = z.enum(['tested', 'experimental', 'from-source', 'theoretical']);
const categoryEnum = z.enum([
  'git', 'format', 'quality-gate', 'anti-loop', 'context-load',
  'observability', 'approval-gate', 'notification',
]);
const hookEventEnum = z.enum([
  'SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse',
  'PostToolUseFailure', 'Stop', 'Notification', 'PreCompact',
  'SessionEnd', 'SubagentStop',
]);

const recipeSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  category: categoryEnum,
  event: hookEventEnum,
  trust: trustEnum,
  description: z.string().min(20).max(160),
});

describe('recipe schema', () => {
  it('accepts a valid minimal recipe', () => {
    const result = recipeSchema.safeParse({
      title: 'Auto-format on Write',
      slug: 'prettier-on-write',
      category: 'format',
      event: 'PostToolUse',
      trust: 'experimental',
      description: 'Run Prettier after Claude writes a file. Fast feedback on formatting violations.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-kebab-case slug', () => {
    const result = recipeSchema.safeParse({
      title: 'X',
      slug: 'Not Kebab Case',
      category: 'format',
      event: 'PostToolUse',
      trust: 'tested',
      description: 'A description that is at least twenty characters long.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown category', () => {
    const result = recipeSchema.safeParse({
      title: 'X',
      slug: 'x',
      category: 'cooking',
      event: 'Stop',
      trust: 'tested',
      description: 'A description that is at least twenty characters long.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects too-short description', () => {
    const result = recipeSchema.safeParse({
      title: 'X',
      slug: 'x',
      category: 'format',
      event: 'Stop',
      trust: 'tested',
      description: 'too short',
    });
    expect(result.success).toBe(false);
  });
});
