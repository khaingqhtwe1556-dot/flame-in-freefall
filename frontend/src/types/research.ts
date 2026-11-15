export type ResearchCategory =
  | 'material-flammability'
  | 'smoke-detection'
  | 'droplet-combustion'
  | 'gaseous-flames'
  | 'modeling'
  | 'adjacent-science'

export type GravityContext =
  | 'microgravity'
  | 'ground'
  | 'mixed'
  | 'unknown'

export type AvailabilityStatus =
  | 'metadata-files-unverified'
  | 'documentation-only'
  | 'not-checked'

export type SafetyRelationship =
  | 'direct'
  | 'supporting'
  | 'adjacent'
  | 'none'

export interface Investigation {
  accession: string
  title: string
  acronym: string
  category: ResearchCategory
  summary: string
  objective: string
  fuelsAndMaterials: string[] | null
  gravityContext: GravityContext
  formats: string[]
  listedFileEntries: number
  availability: AvailabilityStatus
  safetyRelationship: SafetyRelationship
  sourceId: string
  sourceUrl: string
}

export type RankingCriterion =
  | 'fireSafety'
  | 'microgravity'
  | 'datasetAvailability'
  | 'mlSuitability'
  | 'missionApplicability'

export type RankingWeights = Record<RankingCriterion, number>

export interface CriterionEvidence {
  score: number | null
  explanation: string
}

export interface RankedInvestigation {
  investigation: Investigation
  score: number | null
  evidenceCoverage: number
  supportedCriteria: number
  criterionEvidence: Record<RankingCriterion, CriterionEvidence>
}
