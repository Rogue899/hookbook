<script lang="ts">
  import { onMount } from 'svelte';

  let query = $state('');
  let results = $state<Array<{ url: string; meta: { title: string }; excerpt: string }>>([]);
  let pagefind = $state<any>(null);
  let open = $state(false);

  function sanitizeExcerpt(html: string): string {
    return html.replace(/<(?!\/?mark\b)[^>]*>/gi, '');
  }

  onMount(async () => {
    if (typeof window === 'undefined') return;
    try {
      const url = '/pagefind/pagefind.js';
      pagefind = await import(/* @vite-ignore */ url);
      await pagefind.init();
    } catch (e) {
      console.info('Pagefind not yet available; run `pnpm build` to generate the index.');
    }
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
    class="search-input"
    aria-label="Search hookbook"
  />
  {#if open && results.length > 0}
    <ul class="search-results">
      {#each results as r}
        <li>
          <a href={r.url} class="result-item">
            <div class="result-title">{r.meta.title}</div>
            <div class="result-excerpt">{@html sanitizeExcerpt(r.excerpt)}</div>
          </a>
        </li>
      {/each}
    </ul>
  {:else if open && query.length > 0}
    <div class="search-empty">
      No results for "{query}"
    </div>
  {/if}
</div>

<style>
  .search-input {
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--ink);
    background: var(--bg-soft);
    border: 1px solid var(--rule);
    border-radius: 8px;
    padding: 6px 12px;
    width: 12rem;
    outline: none;
    transition: width 200ms, border-color 120ms;
  }
  .search-input::placeholder { color: var(--muted); }
  .search-input:focus {
    width: 16rem;
    border-color: var(--accent-line);
    background: var(--bg-elev);
  }
  .search-results {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 4px;
    width: 20rem;
    max-height: 24rem;
    overflow-y: auto;
    border-radius: 10px;
    border: 1px solid var(--rule);
    background: var(--bg-soft);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    z-index: 50;
    list-style: none;
    padding: 0;
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 0;
  }
  .result-item {
    display: block;
    padding: 8px 12px;
    border-bottom: 1px solid var(--rule);
    color: var(--ink);
    text-decoration: none;
  }
  .result-item:hover { background: var(--bg-soft-2); }
  .result-item:last-child { border-bottom: 0; }
  .result-title {
    font-weight: 500;
    font-size: 14px;
    color: var(--ink);
  }
  .result-excerpt {
    font-size: 12px;
    color: var(--muted);
    margin-top: 2px;
  }
  .result-excerpt :global(mark) {
    background: var(--accent-soft);
    color: var(--accent);
  }
  .search-empty {
    position: absolute;
    right: 0;
    top: 100%;
    margin-top: 4px;
    width: 20rem;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid var(--rule);
    background: var(--bg-soft);
    font-size: 14px;
    color: var(--muted);
  }
</style>
