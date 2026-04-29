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
  class="rounded border border-gray-300 dark:border-gray-700 px-2 py-1 text-xs font-mono hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  aria-live="polite"
>
  {copied ? '✓ Copied' : label}
</button>
