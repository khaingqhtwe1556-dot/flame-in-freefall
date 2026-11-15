import type {
  CriterionEvidence,
  Investigation,
  RankedInvestigation,
  RankingCriterion,
  RankingWeights,
} from '../types/research'

export const rankingCriteria: {
  key: RankingCriterion
  label: string
}[] = [
  { key: 'fireSafety', label: 'Fire-safety relevance' },
  { key: 'microgravity', label: 'Microgravity relevance' },
  { key: 'datasetAvailability', label: 'Dataset availability' },
  { key: 'mlSuitability', label: 'AI/ML suitability' },
  { key: 'missionApplicability', label: 'Moon/Mars applicability' },
]

export const rankingPresets: Record<string, RankingWeights> = {
  'Spacecraft fire safety': {
    fireSafety: 30,
    microgravity: 25,
    datasetAvailability: 20,
    mlSuitability: 15,
    missionApplicability: 10,
  },
  'Machine learning': {
    fireSafety: 10,
    microgravity: 15,
    datasetAvailability: 45,
    mlSuitability: 20,
    missionApplicability: 10,
  },
  'Early fire detection': {
    fireSafety: 30,
    microgravity: 20,
    datasetAvailability: 20,
    mlSuitability: 15,
    missionApplicability: 15,
  },
  'Smoke research': {
    fireSafety: 25,
    microgravity: 20,
    datasetAvailability: 20,
    mlSuitability: 15,
    missionApplicability: 20,
  },
  'Moon missions': {
    fireSafety: 25,
    microgravity: 25,
    datasetAvailability: 15,
    mlSuitability: 15,
    missionApplicability: 20,
  },
  'Mars missions': {
    fireSafety: 25,
    microgravity: 20,
    datasetAvailability: 20,
    mlSuitability: 15,
    missionApplicability: 20,
  },
}

const safetyExplanations = {
  direct: 'The reviewed study description directly addresses a fire-safety function such as material flammability, smoke detection, or suppression.',
  supporting: 'The reviewed study contributes combustion, soot, extinction, or model evidence, but is not itself a complete spacecraft fire-safety test.',
  adjacent: 'The reviewed study is adjacent to combustion safety and should not be treated as direct fire evidence.',
  none: 'The reviewed description does not establish a direct spacecraft fire-safety relationship.',
}

function getEvidence(
  investigation: Investigation,
  criterion: RankingCriterion,
): CriterionEvidence {
  if (criterion === 'fireSafety') {
    const scores = { direct: 5, supporting: 3, adjacent: 1, none: null }
    return {
      score: scores[investigation.safetyRelationship],
      explanation: safetyExplanations[investigation.safetyRelationship],
    }
  }

  if (criterion === 'microgravity') {
    if (investigation.safetyRelationship === 'none') {
      return {
        score: null,
        explanation: 'A gravity context is listed, but the reviewed record is not a direct combustion-safety investigation.',
      }
    }
    const evidence = {
      microgravity: {
        score: 5,
        explanation: 'The reviewed investigation summary identifies a microgravity or reduced-gravity experiment.',
      },
      mixed: {
        score: 4,
        explanation: 'The reviewed summary identifies comparisons or evidence across gravity contexts.',
      },
      ground: {
        score: 2,
        explanation: 'The record is a ground study or model connected to reduced-gravity research, not a microgravity flight measurement.',
      },
      unknown: {
        score: null,
        explanation: 'Gravity context was not established in the reviewed metadata.',
      },
    }
    return evidence[investigation.gravityContext]
  }

  if (criterion === 'missionApplicability') {
    const scores = { direct: 4, supporting: 2, adjacent: null, none: null }
    return {
      score: scores[investigation.safetyRelationship],
      explanation:
        scores[investigation.safetyRelationship] === null
          ? 'The reviewed sources do not establish a mission-safety application for this record.'
          : 'This is a project-defined candidate relevance judgment, not a validated Moon/Mars safety recommendation.',
    }
  }

  return {
    score: null,
    explanation:
      criterion === 'datasetAvailability'
        ? 'PSI file listings are metadata only here; file access, download, schema, and units have not been verified.'
        : 'No file-level schema, labeled target, or representative raw observations were validated for this record.',
  }
}

export function getCriterionEvidence(
  investigation: Investigation,
): Record<RankingCriterion, CriterionEvidence> {
  return {
    fireSafety: getEvidence(investigation, 'fireSafety'),
    microgravity: getEvidence(investigation, 'microgravity'),
    datasetAvailability: getEvidence(investigation, 'datasetAvailability'),
    mlSuitability: getEvidence(investigation, 'mlSuitability'),
    missionApplicability: getEvidence(investigation, 'missionApplicability'),
  }
}

export function adjustWeights(
  weights: RankingWeights,
  changedCriterion: RankingCriterion,
  requestedValue: number,
): RankingWeights {
  const keys = rankingCriteria.map(({ key }) => key)
  const changedValue = Math.max(0, Math.min(100, Math.round(requestedValue)))
  const otherKeys = keys.filter((key) => key !== changedCriterion)
  const otherTotal = otherKeys.reduce((total, key) => total + weights[key], 0)
  const remaining = 100 - changedValue
  const next = { ...weights, [changedCriterion]: changedValue }
  const shares = otherKeys.map((key) => {
    const exactShare =
      otherTotal === 0
        ? remaining / otherKeys.length
        : (remaining * weights[key]) / otherTotal
    const floorShare = Math.floor(exactShare)
    next[key] = floorShare
    return { key, remainder: exactShare - floorShare }
  })
  let unassigned = remaining - otherKeys.reduce((total, key) => total + next[key], 0)

  for (const { key } of shares.sort((a, b) => b.remainder - a.remainder)) {
    if (unassigned <= 0) break
    next[key] += 1
    unassigned -= 1
  }
  return next
}

export function calculateRanking(
  investigations: Investigation[],
  weights: RankingWeights,
): RankedInvestigation[] {
  const totalWeight = rankingCriteria.reduce(
    (total, { key }) => total + weights[key],
    0,
  )

  if (Math.abs(totalWeight - 100) > 0.001) {
    throw new Error('Ranking weights must total 100%.')
  }

  return investigations
    .map((investigation) => {
      const criterionEvidence = getCriterionEvidence(investigation)
      const supported = rankingCriteria.filter(
        ({ key }) => criterionEvidence[key].score !== null,
      )
      const applicableWeight = supported.reduce(
        (total, { key }) => total + weights[key],
        0,
      )
      const weightedScore = supported.reduce(
        (total, { key }) =>
          total + (criterionEvidence[key].score ?? 0) * weights[key],
        0,
      )

      return {
        investigation,
        score:
          applicableWeight > 0
            ? (weightedScore / applicableWeight / 5) * 100
            : null,
        evidenceCoverage: applicableWeight,
        supportedCriteria: supported.length,
        criterionEvidence,
      }
    })
    .sort(
      (a, b) =>
        (b.score ?? -1) - (a.score ?? -1) ||
        b.evidenceCoverage - a.evidenceCoverage ||
        a.investigation.accession.localeCompare(b.investigation.accession),
    )
}
