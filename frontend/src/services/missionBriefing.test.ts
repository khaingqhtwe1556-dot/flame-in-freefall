import { describe, expect, it } from 'vitest'
import { missionBriefingSteps, moveBriefingStep } from './missionBriefing'

describe('guided mission briefing progression', () => {
  it('moves through the sequence and stays within the first and last steps', () => {
    expect(moveBriefingStep(0, -1)).toBe(0)
    expect(moveBriefingStep(0, 1)).toBe(1)
    expect(moveBriefingStep(2, 1)).toBe(3)
    expect(moveBriefingStep(3, 1)).toBe(3)
    expect(missionBriefingSteps[moveBriefingStep(1, 1)].id).toBe('explore')
  })
})
