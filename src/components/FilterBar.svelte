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
  let sort = $state<'trust' | 'recent' | 'alpha'>('trust');
  let view = $state<'grid' | 'list'>('grid');

  const categories = [...new Set(recipes.map((r) => r.category))].sort();
  const events = [...new Set(recipes.map((r) => r.event))].sort();
  const trusts = ['tested', 'experimental', 'from-source', 'theoretical'] as const;
  const trustColors: Record<string, string> = {
    tested: 'var(--trust-tested)',
    experimental: 'var(--trust-experimental)',
    'from-source': 'var(--trust-from-source)',
    theoretical: 'var(--trust-theoretical)',
  };

  const baseFiltered = $derived(filterRecipes(recipes, { category: categoryFilter, trust: trustFilter, event: eventFilter, query }));

  const filtered = $derived.by(() => {
    const arr = [...baseFiltered];
    const trustOrder: Record<string, number> = { tested: 0, experimental: 1, 'from-source': 2, theoretical: 3 };
    if (sort === 'trust') arr.sort((a, b) => (trustOrder[a.trust] ?? 9) - (trustOrder[b.trust] ?? 9) || a.title.localeCompare(b.title));
    else if (sort === 'alpha') arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  });

  const anyFilter = $derived(query || categoryFilter !== 'all' || trustFilter !== 'all' || eventFilter !== 'all');

  function reset() {
    query = '';
    categoryFilter = 'all';
    trustFilter = 'all';
    eventFilter = 'all';
  }
</script>

<div class="filterbar-root">
  <!-- Filter bar -->
  <div class="filter-grid">
    <div class="search-wrap">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="7"></circle>
        <path d="m21 21-4.3-4.3"></path>
      </svg>
      <input
        type="search"
        bind:value={query}
        placeholder="Search recipes, tags, events..."
        aria-label="Search recipes"
        class="filter-input search"
      />
    </div>
    <select bind:value={categoryFilter} aria-label="Filter by category" class="filter-select">
      <option value="all">All categories</option>
      {#each categories as c}<option value={c}>{c}</option>{/each}
    </select>
    <select bind:value={trustFilter} aria-label="Filter by trust tier" class="filter-select">
      <option value="all">All trust tiers</option>
      {#each trusts as t}<option value={t}>{t}</option>{/each}
    </select>
    <select bind:value={eventFilter} aria-label="Filter by event" class="filter-select">
      <option value="all">All events</option>
      {#each events as e}<option value={e}>{e}</option>{/each}
    </select>
  </div>

  <!-- Trust chips row -->
  <div class="trust-chips">
    <span class="chips-label">TRUST:</span>
    <button
      class="chip"
      class:active={trustFilter === 'all'}
      onclick={() => (trustFilter = 'all')}
    >All</button>
    {#each trusts as t}
      <button
        class="chip"
        class:active={trustFilter === t}
        onclick={() => (trustFilter = t)}
      >
        <span
          class="chip-dot"
          class:hollow={t === 'theoretical'}
          style="--dot-color: {trustColors[t]};"
        ></span>
        {t}
      </button>
    {/each}
  </div>

  <!-- Result bar -->
  <div class="result-bar">
    <div class="result-count">
      <strong>{filtered.length}</strong> of {recipes.length} recipe{recipes.length === 1 ? '' : 's'}
      {#if anyFilter}
        <span class="sep">&middot;</span>
        <button class="sort-btn" onclick={reset}>Reset filters</button>
      {/if}
    </div>
    <div class="sort-controls">
      <span>Sort</span>
      <button class="sort-btn" class:active={sort === 'trust'} onclick={() => (sort = 'trust')}>Trust</button>
      <button class="sort-btn" class:active={sort === 'recent'} onclick={() => (sort = 'recent')}>Recent</button>
      <button class="sort-btn" class:active={sort === 'alpha'} onclick={() => (sort = 'alpha')}>A&ndash;Z</button>
      <span class="view-toggle">
        <button class:active={view === 'grid'} onclick={() => (view = 'grid')}>GRID</button>
        <button class:active={view === 'list'} onclick={() => (view = 'list')}>LIST</button>
      </span>
    </div>
  </div>

  <!-- Results -->
  {#if filtered.length === 0}
    <div class="empty-state">
      <div class="empty-title">No recipes match those filters.</div>
      <div>Try widening trust or category — or browse <a href="/methodology/">the methodology page</a> for context on the labels.</div>
      <button class="reset-btn" onclick={reset}>Reset filters</button>
    </div>
  {:else}
    <div class="results" class:grid-view={view === 'grid'} class:list-view={view === 'list'}>
      {#each filtered as r, i (r.slug)}
        <a class="card" href={r.href}>
          <div class="card-meta">
            <span class="card-num">&#x2116; {String(i + 1).padStart(2, '0')}</span>
            <span class="card-event">{r.event}</span>
            <span class="card-cat">{r.category}</span>
          </div>
          <h3 class="card-title">{r.title}</h3>
          <p class="card-desc">{r.description}</p>
          <div class="card-foot">
            <div class="card-tags">
              <span>{r.category}</span>
              <span class="tag-sep">&middot;</span>
              <span>{r.event}</span>
            </div>
            <div class="card-foot-right">
              <span
                class="card-trust-dot"
                class:hollow={r.trust === 'theoretical'}
                style="--dot-color: {trustColors[r.trust]};"
              ></span>
              <span class="card-trust-label">{r.trust}</span>
              <span class="card-arrow">&rarr;</span>
            </div>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .filterbar-root { display: flex; flex-direction: column; gap: 0; }

  /* Filter grid */
  .filter-grid {
    display: grid;
    grid-template-columns: 1.6fr 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 18px;
  }
  @media (max-width: 900px) { .filter-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 520px) { .filter-grid { grid-template-columns: 1fr; } }

  .search-wrap { position: relative; }
  .search-icon {
    position: absolute; left: 12px; top: 50%;
    transform: translateY(-50%);
    color: var(--muted);
    pointer-events: none;
  }
  .filter-input {
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--ink);
    background: var(--bg-soft);
    border: 1px solid var(--rule);
    border-radius: 8px;
    padding: 9px 12px;
    width: 100%;
    outline: none;
  }
  .filter-input::placeholder { color: var(--muted); }
  .filter-input:focus { border-color: var(--accent-line); background: var(--bg-elev); }
  .filter-input.search { padding-left: 36px; }

  .filter-select {
    font-family: var(--font-sans);
    font-size: 14px;
    color: var(--ink);
    background: var(--bg-soft);
    border: 1px solid var(--rule);
    border-radius: 8px;
    padding: 9px 36px 9px 12px;
    width: 100%;
    appearance: none;
    cursor: pointer;
    outline: none;
    background-image: linear-gradient(45deg, transparent 50%, var(--muted) 50%),
                      linear-gradient(135deg, var(--muted) 50%, transparent 50%);
    background-position: calc(100% - 18px) 50%, calc(100% - 13px) 50%;
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
  }
  .filter-select:focus { border-color: var(--accent-line); }

  /* Trust chips */
  .trust-chips {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 18px;
  }
  .chips-label {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-right: 4px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--ink-2);
    background: var(--bg-soft);
    border: 1px solid var(--rule);
    border-radius: 999px;
    padding: 5px 11px;
    cursor: pointer;
    transition: all 120ms;
    user-select: none;
  }
  .chip:hover { border-color: var(--rule-strong); color: var(--ink); }
  .chip.active { background: var(--accent-soft); border-color: var(--accent-line); color: var(--accent); }
  .chip-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--dot-color);
    flex-shrink: 0;
  }
  .chip-dot.hollow {
    background: transparent;
    border: 1.5px solid var(--dot-color);
  }

  /* Result bar */
  .result-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0 18px;
    border-top: 1px solid var(--rule);
    border-bottom: 1px dashed var(--rule);
    margin-bottom: 22px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--muted);
    flex-wrap: wrap;
    gap: 8px;
  }
  .result-count strong { color: var(--ink); font-weight: 500; }
  .sep { margin: 0 4px; }
  .sort-controls {
    display: flex;
    gap: 14px;
    align-items: center;
  }
  .sort-btn {
    color: var(--ink-2);
    cursor: pointer;
    background: none;
    border: 0;
    font: inherit;
    padding: 0;
  }
  .sort-btn:hover { color: var(--ink); }
  .sort-btn.active { color: var(--accent); }
  .view-toggle {
    display: inline-flex;
    border: 1px solid var(--rule);
    border-radius: 6px;
    overflow: hidden;
  }
  .view-toggle button {
    background: none;
    border: 0;
    padding: 4px 10px;
    font: inherit;
    color: var(--muted);
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 11px;
  }
  .view-toggle button.active {
    background: var(--bg-soft);
    color: var(--accent);
  }

  /* Grid/list results */
  .results.grid-view {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
  @media (max-width: 1000px) { .results.grid-view { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  @media (max-width: 620px)  { .results.grid-view { grid-template-columns: 1fr; } }

  .results.list-view {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .results.list-view .card {
    flex-direction: row;
    align-items: stretch;
    min-height: 0;
    padding: 16px 22px;
    gap: 22px;
  }
  .results.list-view .card-meta { margin-bottom: 6px; }
  .results.list-view .card-title { font-size: 19px; margin-bottom: 4px; }
  .results.list-view .card-desc { -webkit-line-clamp: 2; flex: 1; margin: 0; }
  .results.list-view .card-foot { border-top: 0; padding-top: 0; flex: 0 0 auto; flex-direction: column; align-items: flex-end; gap: 8px; }

  /* Card */
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    background: var(--bg-soft);
    border: 1px solid var(--rule);
    border-radius: 12px;
    padding: 20px 22px 18px;
    text-decoration: none;
    color: inherit;
    transition: border-color 140ms, background 140ms;
    min-height: 220px;
  }
  .card:hover { background: var(--bg-soft-2); border-color: var(--rule-strong); }
  .card:hover .card-title { color: var(--accent); }
  .card:hover .card-arrow { transform: translateX(2px); color: var(--accent); }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--muted);
    margin-bottom: 14px;
    letter-spacing: 0.02em;
  }
  .card-num { color: var(--muted-2); }
  .card-event {
    color: var(--ink-2);
    background: var(--bg-elev);
    border: 1px solid var(--rule);
    padding: 2px 7px;
    border-radius: 4px;
  }
  .card-cat { color: var(--muted); }
  .card-title {
    font-family: var(--font-serif);
    font-size: 22px;
    font-weight: 500;
    line-height: 1.2;
    color: var(--ink);
    margin: 0 0 10px;
    letter-spacing: -0.01em;
    transition: color 140ms;
  }
  .card-desc {
    font-size: 14px;
    line-height: 1.55;
    color: var(--ink-2);
    margin: 0 0 16px;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .card-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-top: 12px;
    border-top: 1px dashed var(--rule);
  }
  .card-tags {
    display: flex;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--muted);
  }
  .tag-sep { color: var(--muted-2); }
  .card-foot-right {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .card-trust-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--dot-color);
    flex-shrink: 0;
  }
  .card-trust-dot.hollow {
    background: transparent;
    border: 1.5px solid var(--dot-color);
  }
  .card-trust-label {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-2);
  }
  .card-arrow {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--muted);
    transition: transform 140ms, color 140ms;
  }

  /* Empty state */
  .empty-state {
    border: 1px dashed var(--rule);
    border-radius: 12px;
    padding: 56px 24px;
    text-align: center;
    color: var(--muted);
  }
  .empty-title {
    font-family: var(--font-serif);
    font-size: 22px;
    color: var(--ink);
    margin-bottom: 8px;
  }
  .reset-btn {
    margin-top: 16px;
    display: inline-flex;
    border: 1px solid var(--rule-strong);
    background: var(--bg-soft);
    color: var(--ink);
    border-radius: 6px;
    padding: 6px 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    cursor: pointer;
  }
  .reset-btn:hover { border-color: var(--accent); color: var(--accent); }
</style>
