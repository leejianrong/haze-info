import { CHAPTER_FOCUS } from './map-style.ts'

export const CHAPTERS = [
  { id: 'source', nav: 'Where it starts', focus: CHAPTER_FOCUS.source },
  { id: 'companies', nav: 'Who holds the land', focus: CHAPTER_FOCUS.companies },
  { id: 'people', nav: 'Who breathes it', focus: CHAPTER_FOCUS.people },
  { id: 'government', nav: 'What Jakarta did', focus: CHAPTER_FOCUS.government },
  { id: 'act', nav: 'What you can do', focus: CHAPTER_FOCUS.act },
] as const

export type ChapterId = (typeof CHAPTERS)[number]['id']

export function chapterById(id: string) {
  return CHAPTERS.find((c) => c.id === id) ?? CHAPTERS[0]
}
