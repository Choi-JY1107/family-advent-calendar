import type { Calendar, Member, MemberColor } from './types'

export const COLORS: MemberColor[] = ['lavender', 'peach', 'sage', 'sky', 'butter']

export function colorForIndex(i: number): MemberColor {
  return COLORS[i % COLORS.length]
}

export function generateSlug(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function generateMemberId(): string {
  return Math.random().toString(36).slice(2, 8)
}

export function loadMember(slug: string, calendar: Calendar): Member | null {
  const id = localStorage.getItem(`member_id_${slug}`)
  if (!id) return null
  return calendar.members.find((m) => m.id === id) ?? null
}

export function saveMember(slug: string, memberId: string): void {
  localStorage.setItem(`member_id_${slug}`, memberId)
}

const DEV_NOW_KEY = (slug: string) => `devNow_${slug}`

export function loadDevNow(slug: string): string | null {
  return localStorage.getItem(DEV_NOW_KEY(slug))
}

export function saveDevNow(slug: string, date: string): void {
  localStorage.setItem(DEV_NOW_KEY(slug), date)
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function todayString(slug?: string): string {
  if (slug) {
    const stored = loadDevNow(slug)
    if (stored) return stored
  }
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
