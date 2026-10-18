import type { AllegationStatus } from './schema.ts'

// Reader-facing wording derives from the evidence status. Copy never hand-writes "X burned" (ADR-0002).
export const STATUS_PHRASE: Record<AllegationStatus, string> = {
  detected: 'Burn scar detected inside concession',
  'ngo-alleged': 'Named in an NGO report',
  'ministry-sanctioned': 'Sanctioned by an Indonesian ministry',
  'court-finding': 'Found liable by a court',
}

// Causal language is allowed only once an authority has made a finding.
export function allowsCausalLanguage(status: AllegationStatus): boolean {
  return status === 'ministry-sanctioned' || status === 'court-finding'
}

export const CAUSAL_PATTERN =
  /\b(caused|causing|responsible for|culprit|arsonist|started the fires?)\b/i
