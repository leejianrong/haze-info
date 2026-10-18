import { PersonSchema, type Person } from './schema.ts'

// Real profiles live in src/data/people/*.json. Fictional fixtures are added only to the e2e build (vite --mode e2e),
// so the production bundle never contains them.
const real = import.meta.glob('./people/*.json', { eager: true, import: 'default' })
const fixtures =
  import.meta.env.MODE === 'e2e'
    ? import.meta.glob('../../e2e/fixtures/people/*.json', { eager: true, import: 'default' })
    : {}

export const people: Person[] = [...Object.values(real), ...Object.values(fixtures)]
  .flatMap((list) => list as unknown[])
  .map((p) => PersonSchema.parse(p))

export function peopleIn(category: Person['category'][]): Person[] {
  return people.filter((p) => category.includes(p.category))
}
