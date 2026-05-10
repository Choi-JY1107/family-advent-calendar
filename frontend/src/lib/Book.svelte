<script lang="ts">
  import { onMount } from 'svelte'
  import { listEntries } from './db'
  import { topicFor } from './topics'
  import type { Calendar, Entry, Member } from './types'

  let { calendar }: { calendar: Calendar } = $props()
  let entries = $state<Entry[]>([])
  let loading = $state(true)

  onMount(async () => {
    try {
      entries = await listEntries(calendar.id)
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

  const days = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    date: `2026-05-${String(i + 1).padStart(2, '0')}`,
  }))
</script>

<article class="book">
  <header class="book__header">
    <h1>{calendar.title}</h1>
    <p>2026년 5월</p>
  </header>

  {#if loading}
    <p class="book__loading">로딩…</p>
  {:else}
    <ol class="book__days">
      {#each days as d}
        {@const t = topicFor(d.date)}
        {@const ents = entriesFor(d.date)}
        <li class="book__day" class:book__day--mission={t?.isMission} class:book__day--finale={t?.isFinale}>
          <header class="book__day-header">
            <span class="book__day-num">5/{d.day}</span>
            {#if t?.emoji}<span class="book__day-emoji">{t.emoji}</span>{/if}
            {#if t}<strong class="book__day-title">{t.title}</strong>{/if}
          </header>
          {#if ents.length === 0}
            <p class="book__empty">— 비어있음 —</p>
          {:else}
            <ul class="book__entries">
              {#each ents as e}
                {@const m = memberById(e.member_id)}
                <li class="book__entry book__entry--{m?.color ?? 'lavender'}">
                  <span class="book__entry-name">{m?.name ?? '?'}</span>
                  <span class="book__entry-q">"{e.question}"</span>
                  <p class="book__entry-body">{e.body}</p>
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ol>
  {/if}

  <button class="book__print" onclick={() => window.print()}>📄 인쇄 / PDF 저장</button>
  <a class="book__back" href="/?id={calendar.slug}">← 캘린더로</a>
</article>
