<script lang="ts">
  let { devNow, onChange }: { devNow: string; onChange: (delta: number) => void } = $props()

  function fmt(s: string): string {
    const d = new Date(s)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
</script>

<div class="devtools">
  <span class="devtools__badge">DEV</span>
  <button class="devtools__btn" onclick={() => onChange(-1)} aria-label="어제">◀</button>
  <span class="devtools__date">{fmt(devNow)}</span>
  <button class="devtools__btn" onclick={() => onChange(1)} aria-label="내일">▶</button>
</div>
