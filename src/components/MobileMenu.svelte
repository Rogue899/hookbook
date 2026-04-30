<script lang="ts">
  let open = $state(false);
  type NavItem = { href: string; label: string };
  let { items, current }: { items: NavItem[]; current: string } = $props();
</script>

<button
  type="button"
  class="menu-toggle sm:hidden"
  onclick={() => (open = !open)}
  aria-label={open ? 'Close menu' : 'Open menu'}
  aria-expanded={open}
>
  <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    {#if open}
      <path d="M6 6l12 12M6 18L18 6" stroke-linecap="round" />
    {:else}
      <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
    {/if}
  </svg>
</button>

{#if open}
  <nav
    class="mobile-drawer sm:hidden"
    onclick={() => (open = false)}
    aria-label="Mobile navigation"
  >
    <ul>
      {#each items as item}
        <li>
          <a
            href={item.href}
            class:active={current.startsWith(item.href)}
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .menu-toggle {
    padding: 8px;
    border-radius: 6px;
    background: none;
    border: 0;
    color: var(--ink);
    cursor: pointer;
  }
  .menu-toggle:hover { background: var(--bg-soft); }
  .mobile-drawer {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-soft);
    border-bottom: 1px solid var(--rule);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    z-index: 50;
  }
  .mobile-drawer ul {
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 4px;
    list-style: none;
    margin: 0;
  }
  .mobile-drawer a {
    display: block;
    padding: 8px 10px;
    font-size: 14px;
    color: var(--ink-2);
    text-decoration: none;
    border-radius: 6px;
    border-bottom: 0;
  }
  .mobile-drawer a:hover {
    color: var(--ink);
    background: var(--bg-soft-2);
  }
  .mobile-drawer a.active {
    color: var(--accent);
    background: var(--accent-soft);
  }
</style>
