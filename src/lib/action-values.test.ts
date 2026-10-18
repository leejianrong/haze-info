import { describe, expect, it } from 'vitest'
import actions from '../data/actions.json'
import { ActionCardSchema } from '../data/schema.ts'
import { actionValues } from './action-values.ts'
import { ACTION_DATA_IDS, renderTemplate } from './actions.ts'

describe('action values', () => {
  const values = actionValues()
  it('has a value for every allowed data id', () => {
    for (const id of Object.keys(ACTION_DATA_IDS))
      expect(values[id as keyof typeof values]).toMatch(/^\d[\d,]*$/)
  })
  it('renders every card in actions.json with real values and no leftover placeholders', () => {
    for (const raw of actions) {
      const card = ActionCardSchema.parse(raw)
      const text = renderTemplate(card.template.body, values)
      expect(text, card.id).not.toMatch(/\{\{/)
    }
  })
  it('states the national burned total as sourced', () => {
    expect(values.burnedHaTotal).toBe('285,914')
  })
})
