<script lang="ts">
  import { topicFor } from './topics'
  import { createEntry, uploadEntryImage } from './db'
  import type { Calendar, Entry, Member } from './types'

  let {
    calendar,
    member,
    date,
    entries,
    onClose,
    onSaved,
  }: {
    calendar: Calendar
    member: Member
    date: string
    entries: Entry[]
    onClose: () => void
    onSaved: () => void
  } = $props()

  const topic = $derived(topicFor(date))
  const myEntry = $derived(entries.find((e) => e.member_id === member.id))
  const others = $derived(entries.filter((e) => e.member_id !== member.id))

  let questionIdx = $state<number>(0)
  let customQuestion = $state('')
  let body = $state('')
  let file = $state<File | null>(null)
  let saving = $state(false)
  let error = $state('')

  function selectedQuestion(): string {
    if (questionIdx === -1) return customQuestion.trim()
    return topic?.questions[questionIdx] ?? customQuestion.trim()
  }

  async function save() {
    if (saving) return
    const q = selectedQuestion()
    if (!q || !body.trim()) {
      error = '질문과 답변을 적어주세요.'
      return
    }
    saving = true
    error = ''
    try {
      let imageUrl: string | null = null
      if (file) imageUrl = await uploadEntryImage(file, calendar.slug)
      await createEntry({
        calendar_id: calendar.id,
        member_id: member.id,
        date,
        question: q,
        body: body.trim(),
        image_url: imageUrl,
      })
      onSaved()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '저장 실패'
      error = msg
      saving = false
    }
  }

  function memberById(id: string) {
    return calendar.members.find((m) => m.id === id)
  }

  function onFileChange(e: Event) {
    const input = e.target as HTMLInputElement
    file = input.files?.[0] ?? null
  }

  function formatDate(dStr: string): string {
    const d = new Date(dStr)
    const wd = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
    return `${d.getMonth() + 1}월 ${d.getDate()}일 (${wd})`
  }
</script>

<div class="sheet" role="dialog" aria-modal="true">
  <button class="sheet__close" onclick={onClose} aria-label="닫기">✕</button>

  <header class="sheet__header">
    <p class="sheet__date">{formatDate(date)}</p>
    {#if topic?.emoji}<span class="sheet__emoji">{topic.emoji}</span>{/if}
    {#if topic}<h2 class="sheet__topic">{topic.title}</h2>{/if}
  </header>

  {#if myEntry}
    <section class="sheet__own sheet__own--{member.color}">
      <h3>내 답변</h3>
      <p class="sheet__own-question">"{myEntry.question}"</p>
      <p class="sheet__own-body">{myEntry.body}</p>
      {#if myEntry.image_url}
        <img src={myEntry.image_url} alt="" class="sheet__own-image" />
      {/if}
      <p class="sheet__locked-note">V1에서는 답변 수정이 불가합니다.</p>
    </section>
  {:else}
    <section class="sheet__form">
      <h3>당신의 답변</h3>
      {#if topic}
        <ul class="sheet__questions">
          {#each topic.questions as q, i}
            <li>
              <label class="sheet__question {questionIdx === i ? 'sheet__question--active' : ''}">
                <input
                  type="radio"
                  name="q"
                  checked={questionIdx === i}
                  onchange={() => (questionIdx = i)}
                />
                <span>{q}</span>
              </label>
            </li>
          {/each}
          <li>
            <label class="sheet__question {questionIdx === -1 ? 'sheet__question--active' : ''}">
              <input
                type="radio"
                name="q"
                checked={questionIdx === -1}
                onchange={() => (questionIdx = -1)}
              />
              <input
                type="text"
                placeholder="직접 적어보기"
                bind:value={customQuestion}
                oninput={() => (questionIdx = -1)}
              />
            </label>
          </li>
        </ul>
      {:else}
        <input type="text" placeholder="질문" bind:value={customQuestion} />
      {/if}

      <textarea
        class="sheet__body"
        placeholder="답변을 적어주세요"
        bind:value={body}
        rows="5"
      ></textarea>

      <label class="sheet__file-label">
        <span>📷 사진 (선택)</span>
        <input type="file" accept="image/*" onchange={onFileChange} class="sheet__file" />
      </label>

      {#if error}<p class="sheet__error">{error}</p>{/if}

      <button class="sheet__save" onclick={save} disabled={saving}>
        {saving ? '저장 중…' : '저장'}
      </button>
    </section>
  {/if}

  {#if others.length > 0}
    <section class="sheet__others">
      <h3>가족의 답변</h3>
      <ul class="sheet__others-list">
        {#each others as e}
          {@const om = memberById(e.member_id)}
          <li class="sheet__other sheet__other--{om?.color ?? 'lavender'}">
            <span class="sheet__other-name">{om?.name ?? '?'}</span>
            <p class="sheet__other-question">"{e.question}"</p>
            <p class="sheet__other-body">{e.body}</p>
            {#if e.image_url}
              <img src={e.image_url} alt="" class="sheet__other-image" />
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</div>
