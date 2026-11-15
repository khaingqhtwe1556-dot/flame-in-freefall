import catalog from '../../../data/sources.json'

export interface ResearchSource {
  id: string
  title: string
  kind: 'Repository' | 'Science overview' | 'Video' | 'Technical guide' | 'Incident history' | 'Technology transfer'
  url: string
  relevance: string
}

export interface HistoricalIncident {
  sourceId: string
  title: string
  year: number
}

export const researchSources = catalog.researchSources as ResearchSource[]
export const historicalIncidents = catalog.historicalIncidents as HistoricalIncident[]
