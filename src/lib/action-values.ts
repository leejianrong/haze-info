import burnedData from '../data/burned-area.json'
import { companies } from '../data/companies.ts'
import { BurnedAreaSchema } from '../data/schema.ts'
import { ACTION_DATA_IDS, type ActionDataId } from './actions.ts'
import { formatValue } from './format.ts'

// Plain numbers with thousands separators, filled into action messages. Each id maps to a sourced Stat.
export function actionValues(): Record<ActionDataId, string> {
  const burned = BurnedAreaSchema.parse(burnedData)
  const num = (v: number | string) => formatValue(v, '').trim()
  const sector = (name: string) => {
    const s = burned.bySector.find((x) => x.sector === name)
    if (!s) throw new Error(`no ${name} sector in burned-area.json`)
    return num(s.stat.value)
  }
  const concessionHa = (slug: string, concession?: string) => {
    const c = companies.find((x) => x.slug === slug)
    const k = c?.concessions.find((x) => !concession || x.name === concession)
    if (!k) throw new Error(`no concession for ${slug}`)
    return num(k.burnedHa.value)
  }
  const values: Record<ActionDataId, string> = {
    burnedHaTotal: num(burned.total.value),
    burnedHaInConcessions: num(burned.inConcessions.value),
    burnedHaPalm: sector('palm'),
    burnedHaPulpwood: sector('pulpwood'),
    burnedHaMining: sector('mining'),
    limpahSejahteraBurnedHa: concessionHa('first-resources', 'PT Limpah Sejahtera'),
    mayangkaraBurnedHa: concessionHa('mayangkara-tanaman-industri'),
  }
  for (const id of Object.keys(ACTION_DATA_IDS)) {
    if (!(id in values)) throw new Error(`no value for ${id}`)
  }
  return values
}
