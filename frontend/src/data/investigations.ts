import catalog from '../../../data/investigations.json'
import type {
  AvailabilityStatus,
  GravityContext,
  Investigation,
  ResearchCategory,
} from '../types/research'

export const PSI_SEARCH_URL = 'https://psi.nasa.gov/physci/repo/search?q=combustion'
export const NASA_COMBUSTION_URL =
  'https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/'

export const investigations = catalog as Investigation[]

export const categoryLabels: Record<ResearchCategory, string> = {
  'material-flammability': 'Material flammability',
  'smoke-detection': 'Smoke & detection',
  'droplet-combustion': 'Droplet combustion',
  'gaseous-flames': 'Gaseous flames',
  modeling: 'Modeling & analysis',
  'adjacent-science': 'Adjacent science',
}

export const gravityLabels: Record<GravityContext, string> = {
  microgravity: 'Microgravity / reduced-g',
  ground: 'Ground study',
  mixed: 'Mixed gravity context',
  unknown: 'Not specified',
}

export const availabilityLabels: Record<AvailabilityStatus, string> = {
  'metadata-files-unverified': 'Metadata found; files unverified',
  'documentation-only': 'Documentation only',
  'not-checked': 'Access not checked',
}
