<script lang="ts">
  import { saveMember } from './store'
  import type { Calendar, Member } from './types'

  let { calendar, onPick }: { calendar: Calendar; onPick: (m: Member) => void } = $props()

  function pick(m: Member) {
    saveMember(calendar.slug, m.id)
    onPick(m)
  }
</script>

<section class="member-picker">
  <h1 class="member-picker__title">{calendar.title}</h1>
  <p class="member-picker__sub">당신은 누구신가요?</p>
  <ul class="member-picker__list">
    {#each calendar.members as m}
      <li>
        <button
          class="member-picker__card member-picker__card--{m.color}"
          onclick={() => pick(m)}
        >
          <span class="member-picker__name">{m.name}</span>
        </button>
      </li>
    {/each}
  </ul>
</section>
