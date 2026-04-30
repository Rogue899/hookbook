<script lang="ts">
  let { text, label = 'Copy' }: { text: string; label?: string } = $props();
  let copied = $state(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch (e) {
      console.error('Copy failed', e);
    }
  }
</script>

<button
  type="button"
  onclick={handleCopy}
  class="copy-btn"
  aria-live="polite"
>
  {copied ? '✓ Copied' : label}
</button>

<style>
  .copy-btn {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--ink-2);
    background: var(--bg-soft);
    border: 1px solid var(--rule);
    border-radius: 6px;
    padding: 4px 10px;
    cursor: pointer;
    transition: border-color 120ms, color 120ms;
  }
  .copy-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
</style>
