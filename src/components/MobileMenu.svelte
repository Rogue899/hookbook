<script lang="ts">
  let open = $state(false);
  type NavItem = { href: string; label: string };
  let { items, current }: { items: NavItem[]; current: string } = $props();
</script>

<button
  type="button"
  class="sm:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-900"
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
  <div
    class="sm:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-lg z-50"
    onclick={() => (open = false)}
    role="navigation"
  >
    <ul class="flex flex-col p-4 gap-3 text-sm">
      {#each items as item}
        <li>
          <a
            href={item.href}
            class="block py-2 hover:text-[var(--color-accent)] {current.startsWith(item.href) ? 'text-[var(--color-accent)] font-medium' : ''}"
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
{/if}
