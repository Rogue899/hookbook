<script lang="ts">
  import { filterRecipes } from '../lib/filter-recipes';

  type Recipe = {
    slug: string;
    title: string;
    category: string;
    event: string;
    trust: string;
    description: string;
    href: string;
  };

  let { recipes }: { recipes: Recipe[] } = $props();

  let categoryFilter = $state('all');
  let trustFilter = $state('all');
  let eventFilter = $state('all');
  let query = $state('');

  const categories = [...new Set(recipes.map((r) => r.category))].sort();
  const events = [...new Set(recipes.map((r) => r.event))].sort();
  const trusts = ['tested', 'experimental', 'from-source', 'theoretical'];

  const filtered = $derived(filterRecipes(recipes, { category: categoryFilter, trust: trustFilter, event: eventFilter, query }));
</script>

<div class="space-y-4">
  <div class="grid gap-3 sm:grid-cols-4">
    <input
      type="search"
      bind:value={query}
      placeholder="Search recipes..."
      aria-label="Search recipes"
      class="rounded border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm"
    />
    <select bind:value={categoryFilter} aria-label="Filter by category" class="rounded border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm">
      <option value="all">All categories</option>
      {#each categories as c}<option value={c}>{c}</option>{/each}
    </select>
    <select bind:value={trustFilter} aria-label="Filter by trust tier" class="rounded border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm">
      <option value="all">All trust tiers</option>
      {#each trusts as t}<option value={t}>{t}</option>{/each}
    </select>
    <select bind:value={eventFilter} aria-label="Filter by event" class="rounded border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm">
      <option value="all">All events</option>
      {#each events as e}<option value={e}>{e}</option>{/each}
    </select>
  </div>

  <p class="text-sm text-gray-600 dark:text-gray-400">{filtered.length} of {recipes.length} recipes</p>

  <ul class="grid gap-4 sm:grid-cols-2">
    {#each filtered as r (r.slug)}
      <li class="rounded border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-400 transition-colors">
        <a href={r.href} class="block">
          <h3 class="font-serif text-lg mb-1">{r.title}</h3>
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">{r.description}</p>
          <div class="flex gap-2 text-xs text-gray-500">
            <span>{r.category}</span>
            <span>·</span>
            <span>{r.event}</span>
            <span>·</span>
            <span>{r.trust}</span>
          </div>
        </a>
      </li>
    {/each}
  </ul>
</div>
