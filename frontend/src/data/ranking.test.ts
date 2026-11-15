import { describe, expect, it } from 'vitest'
import { investigations } from './investigations'
import {
  adjustWeights,
  calculateRanking,
  rankingPresets,
} from './ranking'

describe('ranking evidence model', () => {
  it('contains the reviewed PSI record count and listed inventory total', () => {
    expect(investigations).toHaveLength(26)
    expect(new Set(investigations.map((item) => item.accession)).size).toBe(26)
    expect(
      investigations.reduce((total, item) => total + item.listedFileEntries, 0),
    ).toBe(73909)
  })

  it('keeps every ranking preset at 100 percent', () => {
    for (const weights of Object.values(rankingPresets)) {
      expect(Object.values(weights).reduce((total, value) => total + value, 0)).toBe(100)
    }
  })

  it('redistributes weights so a slider adjustment preserves the total', () => {
    const adjusted = adjustWeights(
      rankingPresets['Spacecraft fire safety'],
      'datasetAvailability',
      60,
    )
    expect(Object.values(adjusted).reduce((total, value) => total + value, 0)).toBeCloseTo(100)
    expect(adjusted.datasetAvailability).toBe(60)
  })

  it('does not convert unverified dataset and ML evidence into zero scores', () => {
    const burningRate = investigations.find((item) => item.accession === 'PSI-20')
    if (!burningRate) throw new Error('Expected PSI-20 in the reviewed catalog.')
    const [ranked] = calculateRanking(
      [burningRate],
      rankingPresets['Spacecraft fire safety'],
    )

    expect(ranked.criterionEvidence.datasetAvailability.score).toBeNull()
    expect(ranked.criterionEvidence.mlSuitability.score).toBeNull()
    expect(ranked.evidenceCoverage).toBe(65)
    expect(ranked.score).toBeCloseTo(96.923, 2)
  })

  it('leaves a record unscored when none of its criteria has evidence', () => {
    const adjacentRecord = investigations.find((item) => item.accession === 'PSI-108')
    if (!adjacentRecord) throw new Error('Expected PSI-108 in the reviewed catalog.')
    const [ranked] = calculateRanking(
      [adjacentRecord],
      rankingPresets['Spacecraft fire safety'],
    )

    expect(ranked.score).toBeNull()
    expect(ranked.evidenceCoverage).toBe(0)
  })

  it('rejects weights that do not total 100 percent', () => {
    expect(() =>
      calculateRanking(investigations.slice(0, 1), {
        ...rankingPresets['Spacecraft fire safety'],
        fireSafety: 31,
      }),
    ).toThrow('Ranking weights must total 100%.')
  })
})
