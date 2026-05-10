<script lang="ts">
  import { onMount } from 'svelte'
  import Landing from './lib/Landing.svelte'
  import CreateForm from './lib/CreateForm.svelte'
  import MemberPicker from './lib/MemberPicker.svelte'
  import Calendar from './lib/Calendar.svelte'
  import Book from './lib/Book.svelte'
  import { loadMember } from './lib/store'
  import { getCalendarBySlug } from './lib/db'
  import type { Calendar as CalendarT, Member } from './lib/types'

  type Route = 'loading' | 'landing' | 'create' | 'pick-member' | 'calendar' | 'book' | 'not-found'

  let route = $state<Route>('loading')
  let calendar = $state<CalendarT | null>(null)
  let member = $state<Member | null>(null)
  let isDev = $state(false)

  async function init() {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('id')
    const mode = params.get('mode')
    isDev = params.get('dev') === '1'

    if (mode === 'create' && !id) {
      route = 'create'
      return
    }

    if (!id) {
      route = 'landing'
      return
    }

    try {
      const cal = await getCalendarBySlug(id)
      if (!cal) {
        route = 'not-found'
        return
      }
      calendar = cal
      const mem = loadMember(id, cal)
      if (!mem) {
        route = 'pick-member'
        return
      }
      member = mem
      route = mode === 'book' ? 'book' : 'calendar'
    } catch (e) {
      console.error(e)
      route = 'not-found'
    }
  }

  function onMemberPicked(m: Member) {
    member = m
    route = 'calendar'
  }

  onMount(init)
</script>

{#if route === 'loading'}
  <div class="app__loading">로딩…</div>
{:else if route === 'landing'}
  <Landing />
{:else if route === 'create'}
  <CreateForm />
{:else if route === 'pick-member' && calendar}
  <MemberPicker {calendar} onPick={onMemberPicked} />
{:else if route === 'calendar' && calendar && member}
  <Calendar {calendar} {member} {isDev} />
{:else if route === 'book' && calendar}
  <Book {calendar} />
{:else if route === 'not-found'}
  <div class="app__not-found">
    <p>캘린더를 찾을 수 없어요.</p>
    <a href="/">처음으로</a>
  </div>
{/if}
