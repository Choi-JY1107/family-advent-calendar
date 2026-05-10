<script lang="ts">
  import { createCalendar } from './db'

  let title = $state('우리집 5월')
  let names = $state(['엄마', '아빠', '나'])
  let creating = $state(false)
  let error = $state('')

  function addMember() {
    if (names.length >= 5) return
    names = [...names, '']
  }

  function removeMember(i: number) {
    names = names.filter((_, j) => j !== i)
  }

  async function submit(e: Event) {
    e.preventDefault()
    if (creating) return
    const cleaned = names.map((n) => n.trim()).filter(Boolean)
    if (!title.trim() || cleaned.length < 2) {
      error = '제목과 멤버 2명 이상을 입력해주세요.'
      return
    }
    creating = true
    error = ''
    try {
      const cal = await createCalendar(title.trim(), cleaned)
      window.location.href = `/?id=${cal.slug}`
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '오류가 발생했어요.'
      error = msg
      creating = false
    }
  }
</script>

<form class="create-form" onsubmit={submit}>
  <h1 class="create-form__title">캘린더 만들기</h1>

  <label class="create-form__field">
    <span>캘린더 제목</span>
    <input bind:value={title} placeholder="우리집 5월" />
  </label>

  <fieldset class="create-form__members">
    <legend>가족 구성원 (2~5명)</legend>
    {#each names, i}
      <div class="create-form__member-row">
        <input bind:value={names[i]} placeholder="이름" />
        {#if names.length > 2}
          <button type="button" onclick={() => removeMember(i)} aria-label="삭제">✕</button>
        {/if}
      </div>
    {/each}
    {#if names.length < 5}
      <button type="button" class="create-form__add" onclick={addMember}>+ 멤버 추가</button>
    {/if}
  </fieldset>

  {#if error}<p class="create-form__error">{error}</p>{/if}

  <button type="submit" class="create-form__submit" disabled={creating}>
    {creating ? '만드는 중…' : '캘린더 만들기'}
  </button>

  <a href="/" class="create-form__back">← 처음으로</a>
</form>
