<script lang="ts">
  type Trust = 'tested' | 'experimental' | 'from-source' | 'theoretical';
  let { trust }: { trust: Trust } = $props();

  const meta: Record<Trust, { color: string; label: string; title: string; hollow?: boolean }> = {
    tested: {
      color: 'var(--trust-tested)',
      label: 'tested',
      title: 'Tarek has run this in his own workflow for ≥1 session',
    },
    experimental: {
      color: 'var(--trust-experimental)',
      label: 'experimental',
      title: 'Installed but not yet proven under real load',
    },
    'from-source': {
      color: 'var(--trust-from-source)',
      label: 'from-source',
      title: 'Verbatim from official docs, Boris\'s repo, or cited community source',
    },
    theoretical: {
      color: 'var(--trust-theoretical)',
      label: 'theoretical',
      title: 'Should work per docs but not yet tested in real workflow',
      hollow: true,
    },
  };

  const m = $derived(meta[trust]);
</script>

<span
  class="trust-tag"
  title={m.title}
>
  <span
    class="trust-dot"
    class:hollow={m.hollow}
    style="--dot-color: {m.color};"
    aria-hidden="true"
  ></span>
  <span>{m.label}</span>
</span>

<style>
  .trust-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.02em;
    color: var(--ink-2);
    padding: 3px 8px;
    background: var(--bg-soft);
    border: 1px solid var(--rule);
    border-radius: 999px;
  }
  .trust-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--dot-color);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--dot-color) 15%, transparent);
    flex-shrink: 0;
  }
  .trust-dot.hollow {
    background: transparent;
    border: 1.5px solid var(--dot-color);
    width: 10px;
    height: 10px;
    box-shadow: none;
  }
</style>
