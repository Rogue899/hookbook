import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const trustEnum = z.enum(['tested', 'experimental', 'from-source', 'theoretical']);

const categoryEnum = z.enum([
  'git',
  'format',
  'quality-gate',
  'anti-loop',
  'context-load',
  'observability',
  'approval-gate',
  'notification',
]);

const hookEventEnum = z.enum([
  'SessionStart',
  'UserPromptSubmit',
  'PreToolUse',
  'PostToolUse',
  'PostToolUseFailure',
  'Stop',
  'Notification',
  'PreCompact',
  'SessionEnd',
  'SubagentStop',
]);

const hookTypeEnum = z.enum(['command', 'http', 'prompt', 'agent', 'mcp_tool']);

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'must be kebab-case'),
    category: categoryEnum,
    event: hookEventEnum,
    trust: trustEnum,
    description: z.string().min(20).max(160),

    // optional
    matcher: z.string().optional(),
    hook_type: hookTypeEnum.optional(),
    tags: z.array(z.string()).optional(),
    source: z.string().optional(),
    source_url: z.string().url().optional(),
    related_events: z.array(hookEventEnum).optional(),
    related_recipes: z.array(z.string()).optional(),
    related_agents: z.array(z.string()).optional(),
    contributor: z.string().optional(),
    viral: z.boolean().optional(),

    // tested-only metadata
    tested_on: z
      .array(
        z.object({
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          sessions: z.number().int().nonnegative(),
          note: z.string(),
        }),
      )
      .optional(),
    platform: z.array(z.enum(['macos', 'linux', 'windows'])).optional(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/events' }),
  schema: z.object({
    name: hookEventEnum,
    description: z.string().min(20),
    when_fires: z.string().min(20),
    payload_fields: z.array(z.string()).optional(),
    common_matchers: z.array(z.string()).optional(),
    gotchas: z.array(z.string()).optional(),
  }),
});

const pitfalls = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pitfalls' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    severity: z.enum(['low', 'medium', 'high']),
    description: z.string().min(20),
    related_events: z.array(hookEventEnum).optional(),
  }),
});

const changelog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/changelog' }),
  schema: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    title: z.string().min(1),
    type: z.enum(['trust-promotion', 'new-recipe', 'site-update', 'announcement']),
    related_recipes: z.array(z.string()).optional(),
  }),
});

const agents = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/agents' }),
  schema: z.object({
    name: z.string().regex(/^[a-z0-9-]+$/),
    description: z.string().min(20),
    tools: z.array(z.string()).optional(),
    trust: trustEnum,
    related_recipes: z.array(z.string()).optional(),
  }),
});

export const collections = { recipes, events, pitfalls, changelog, agents };
