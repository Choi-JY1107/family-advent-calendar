<script lang="ts">
  import { onMount } from 'svelte'
  import { listEntries } from './db'
  import { todayString, saveDevNow } from './store'
  import { topicFor } from './topics'
  import type { Calendar, Entry, Member } from './types'
  import EntrySheet from './EntrySheet.svelte'
  import DevTools from './DevTools.svelte'

  let {
    calendar,
    member,
    isDev,
  }: { calendar: Calendar; member: Member; isDev: boolean } = $props()

  let entries = $state<Entry[]>([])
  let loading = $state(true)
  let openDate = $state<string | null>(null)
  let devNow = $state<string>('2026-05-01')
  let toast = $state('')
  let toastTimer: ReturnType<typeof setTimeout> | null = null

  type Cell =
    | { kind: 'may'; date: string; day: number }
    | { kind: 'pad'; day: number }

  const cells: Cell[] = buildCells()

  function buildCells(): Cell[] {
    const out: Cell[] = []
    const may1 = new Date(2026, 4, 1)
    const may1Dow = may1.getDay()
    for (let i = may1Dow - 1; i >= 0; i--) {
      const d = new Date(2026, 4, -i)
      out.push({ kind: 'pad', day: d.getDate() })
    }
    for (let d = 1; d <= 31; d++) {
      out.push({ kind: 'may', date: `2026-05-${String(d).padStart(2, '0')}`, day: d })
    }
    let extra = 1
    while (out.length < 42) {
      out.push({ kind: 'pad', day: extra++ })
    }
    return out
  }

  async function refresh() {
    entries = await listEntries(calendar.id)
  }

  onMount(async () => {
    devNow = todayString(calendar.slug)
    try {
      await refresh()
    } finally {
      loading = false
    }
  })

  function memberById(id: string): Member | undefined {
    return calendar.members.find((m) => m.id === id)
  }

  function entriesFor(date: string): Entry[] {
    return entries.filter((e) => e.date === date)
  }

  function isLocked(date: string): boolean {
    return date > devNow
  }

  function showToast(msg: string) {
    toast = msg
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toast = ''
    }, 1800)
  }

  function openCell(date: string) {
    if (isLocked(date)) {
      showToast('아직 열리지 않았어요')
      return
    }
    openDate = date
  }

  function closeSheet() {
    openDate = null
  }

  async function onSaved() {
    await refresh()
    openDate = null
  }

  function changeDevNow(delta: number) {
    const d = new Date(devNow)
    d.setDate(d.getDate() + delta)
    if (d.getFullYear() !== 2026 || d.getMonth() !== 4) return
    if (d.getDate() < 1 || d.getDate() > 31) return
    const newStr = `2026-05-${String(d.getDate()).padStart(2, '0')}`
    devNow = newStr
    saveDevNow(calendar.slug, newStr)
  }
</script>

<header class="cal__header">
  <div>
    <h1 class="cal__title">{calendar.title}</h1>
    <p class="cal__sub">2026년 5월 · <span class="cal__sub-name cal__sub-name--{member.color}">{member.name}</span>으로 보는 중</p>
  </div>
  {#if isDev}
    <DevTools {devNow} onChange={changeDevNow} />
  {/if}
</header>

<div class="cal__weekdays">
  <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
</div>

<div class="cal__grid" class:cal__grid--loading={loading}>
  {#each cells as cell}
    {#if cell.kind === 'pad'}
      <div class="cell cell--out"></div>
    {:else}
      {@const t = topicFor(cell.date)}
      {@const dayEntries = entriesFor(cell.date)}
      {@const locked = isLocked(cell.date)}
      {@const isToday = cell.date === devNow}
      <button
        class="cell"
        class:cell--locked={locked}
        class:cell--today={isToday}
        class:cell--mission={t?.isMission}
        class:cell--finale={t?.isFinale}
        class:cell--filled={dayEntries.length > 0}
        onclick={() => openCell(cell.date)}
        type="button"
      >
        <span class="cell__day">{cell.day}</span>
        {#if t?.emoji}<span class="cell__emoji">{t.emoji}</span>{/if}
        {#if locked}
          <span class="cell__lock">🔒</span>
        {:else if dayEntries.length > 0}
          <div class="cell__dots">
            {#each dayEntries as e}
              {@const m = memberById(e.member_id)}
              <span class="cell__dot cell__dot--{m?.color ?? 'lavender'}"></span>
            {/each}
          </div>
        {/if}
      </button>
    {/if}
  {/each}
</div>

<a class="cal__book-link" href="/?id={calendar.slug}&mode=book{isDev ? '&dev=1' : ''}">📖 한 페이지로 보기</a>

{#if toast}
  <div class="toast">{toast}</div>
{/if}

{#if openDate}
  <EntrySheet
    {calendar}
    {member}
    date={openDate}
    entries={entriesFor(openDate)}
    onClose={closeSheet}
    {onSaved}
  />
{/if}
