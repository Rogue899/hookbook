<script lang="ts">
  type Trust = 'tested' | 'experimental' | 'from-source' | 'theoretical';
  let { trust }: { trust: Trust } = $props();

  const meta: Record<Trust, { emoji: string; label: string; bg: string; fg: string; title: string }> = {
    tested: {
      emoji: '🟢',
      label: 'Tested',
      bg: 'bg-green-100 dark:bg-green-900/30',
      fg: 'text-green-900 dark:text-green-200',
      title: 'Tarek has run this in his own workflow for ≥1 session',
    },
    experimental: {
      emoji: '🟡',
      label: 'Experimental',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      fg: 'text-yellow-900 dark:text-yellow-200',
      title: 'Installed but not yet proven under real load',
    },
    'from-source': {
      emoji: '🔵',
      label: 'From source',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      fg: 'text-blue-900 dark:text-blue-200',
      title: 'Verbatim from official docs, Boris\'s repo, or cited community source',
    },
    theoretical: {
      emoji: '⚠️',
      label: 'Theoretical',
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      fg: 'text-orange-900 dark:text-orange-200',
      title: 'Should work per docs but not yet tested in real workflow',
    },
  };

  const m = $derived(meta[trust]);
</script>

<span
  class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium {m.bg} {m.fg}"
  title={m.title}
>
  <span aria-hidden="true">{m.emoji}</span>
  <span>{m.label}</span>
</span>
