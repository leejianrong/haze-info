// Action cards (ADR-0008): fill a message template and build a mailto link. Nothing is sent or stored.

// Data ids a template may cite. Each maps to a Stat in src/data. The live PSI/PM2.5 snapshot is not allowed.
export const ACTION_DATA_IDS = {
  burnedHaTotal: 'burned-area.json: total',
  burnedHaInConcessions: 'burned-area.json: inConcessions',
  burnedHaPalm: 'burned-area.json: bySector palm',
  burnedHaPulpwood: 'burned-area.json: bySector pulpwood',
  burnedHaMining: 'burned-area.json: bySector mining',
  limpahSejahteraBurnedHa: 'companies/first-resources.json: PT Limpah Sejahtera burnedHa',
  mayangkaraBurnedHa: 'companies/mayangkara-tanaman-industri.json: burnedHa',
} as const
export type ActionDataId = keyof typeof ACTION_DATA_IDS

const PLACEHOLDER = /\{\{\s*([A-Za-z0-9_-]+)\s*\}\}/g

export function placeholdersIn(body: string): string[] {
  return [...new Set([...body.matchAll(PLACEHOLDER)].map((m) => m[1]))]
}

export function renderTemplate(body: string, values: Record<string, string>): string {
  return body.replace(PLACEHOLDER, (_, id: string) => {
    if (!(id in ACTION_DATA_IDS)) throw new Error(`unknown placeholder id: ${id}`)
    const v = values[id]
    if (v === undefined) throw new Error(`missing value for placeholder: ${id}`)
    return v
  })
}

export function mailto(address: string, subject: string, body: string): string {
  return `mailto:${address}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
