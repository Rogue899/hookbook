<script lang="ts">
  import { onMount } from 'svelte';

  let query = $state('');
  let results = $state<Array<{ url: string; meta: { title: string }; excerpt: string }>>([]);
  let pagefind = $state<any>(null);
  let open = $state(false);

  onMount(async () => {
    if (typeof window === 'undefined') return;
    // @ts-ignore — pagefind is a runtime-fetched JS module
    pagefind = await import('/pagefind/pagefind.js');
    await pagefind.init();
  });

  async function search() {
    if (!pagefind || !query.trim()) {
      results = [];
      return;
    }
    const search = await pagefind.search(query);
    const data = await Promise.all(search.results.slice(0, 8).map((r: any) => r.data()));
    results = data;
  }

  function handleInput(e: Event) {
    query = (e.target as HTMLInputElement).value;
    open = query.length > 0;
    search();
  }

  function handleBlur() {
    setTimeout(() => (open = false), 200);
  }
</script>

<div class="relative">
  <input
    type="search"
    placeholder="Search..."
    value={query}
    oninput={handleInput}
    onfocus={() => (open = query.length > 0)}
    onblur={handleBlur}
    class="rounded border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm w-48 focus:w-64 transition-[width]"
    aria-label="Search hookbook"
  />
  {#if open && results.length > 0}
    <ul class="absolute right-0 top-full mt-1 w-80 max-h-96 overflow-y-auto rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-lg z-50">
      {#each results as r}
        <li>
          <a href={r.url} class="block px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div class="font-medium text-sm">{r.meta.title}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">{@html r.excerpt}</div>
          </a>
        </li>
      {/each}
    </ul>
  {:else if open && query.length > 0}
    <div class="absolute right-0 top-full mt-1 w-80 px-3 py-2 rounded border bg-white dark:bg-gray-950 text-sm text-gray-500">
      No results for "{query}"
    </div>
  {/if}
</div>
