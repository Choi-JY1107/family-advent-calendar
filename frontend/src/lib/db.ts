import { getSupabase } from './supabase'
import { generateSlug, generateMemberId, colorForIndex } from './store'
import type { Calendar, Entry, Member } from './types'

export async function createCalendar(title: string, names: string[]): Promise<Calendar> {
  const supa = getSupabase()
  const slug = generateSlug()
  const members: Member[] = names.map((name, i) => ({
    id: generateMemberId(),
    name,
    color: colorForIndex(i),
  }))
  const { data, error } = await supa
    .from('calendars')
    .insert({ slug, title, members, year: 2026 })
    .select()
    .single()
  if (error) throw error
  return data as Calendar
}

export async function getCalendarBySlug(slug: string): Promise<Calendar | null> {
  const supa = getSupabase()
  const { data, error } = await supa
    .from('calendars')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data as Calendar | null
}

export async function listEntries(calendarId: string): Promise<Entry[]> {
  const supa = getSupabase()
  const { data, error } = await supa
    .from('entries')
    .select('*')
    .eq('calendar_id', calendarId)
    .order('date')
  if (error) throw error
  return (data ?? []) as Entry[]
}

export type CreateEntryInput = {
  calendar_id: string
  member_id: string
  date: string
  question: string
  body: string | null
  image_url: string | null
}

export async function createEntry(input: CreateEntryInput): Promise<Entry> {
  const supa = getSupabase()
  const { data, error } = await supa.from('entries').insert(input).select().single()
  if (error) throw error
  return data as Entry
}

export async function uploadEntryImage(file: File, slug: string): Promise<string> {
  const supa = getSupabase()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`
  const { error: upErr } = await supa.storage.from('entries').upload(path, file)
  if (upErr) throw upErr
  const { data } = supa.storage.from('entries').getPublicUrl(path)
  return data.publicUrl
}
