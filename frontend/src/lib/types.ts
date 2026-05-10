export type MemberColor = 'lavender' | 'peach' | 'sage' | 'sky' | 'butter'

export type Member = {
  id: string
  name: string
  color: MemberColor
}

export type Calendar = {
  id: string
  slug: string
  title: string
  members: Member[]
  year: number
  created_at: string
}

export type Entry = {
  id: string
  calendar_id: string
  member_id: string
  date: string
  question: string
  body: string | null
  image_url: string | null
  created_at: string
}
