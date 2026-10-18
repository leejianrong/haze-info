import { describe, expect, it } from 'vitest'
import { checkBudgets, type Budget } from './budget-lib.ts'

const budgets: Budget[] = [{ label: 'app script', pattern: /^index-.*\.js$/, limitKb: 10 }]

describe('checkBudgets', () => {
  it('passes under budget and sums matching files', () => {
    const r = checkBudgets(
      [
        { name: 'index-a.js', gzipBytes: 4096 },
        { name: 'index-b.js', gzipBytes: 4096 },
      ],
      budgets,
    )
    expect(r[0].ok).toBe(true)
    expect(r[0].bytes).toBe(8192)
  })
  it('fails over budget', () => {
    expect(checkBudgets([{ name: 'index-a.js', gzipBytes: 20000 }], budgets)[0].ok).toBe(false)
  })
  it('fails when nothing matches, so a renamed bundle cannot slip past', () => {
    expect(checkBudgets([{ name: 'other.js', gzipBytes: 1 }], budgets)[0].ok).toBe(false)
  })
})
