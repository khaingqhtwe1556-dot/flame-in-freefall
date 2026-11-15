import { describe, expect, it } from 'vitest'
import { getGravityExplanation } from './gravityExplanation'

describe('gravity comparison explanation', () => {
  it('describes the selected concept and explicitly qualifies display settings', () => {
    const text = getGravityExplanation('microgravity', 24, 35)
    expect(text).toContain('low-gravity concept')
    expect(text).toContain('24% oxygen and 35% airflow')
    expect(text).toContain('not experimental inputs')
  })
})
