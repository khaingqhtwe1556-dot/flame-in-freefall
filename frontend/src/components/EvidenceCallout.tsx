import { ArrowUpRight, Info, Microscope, Sparkles } from 'lucide-react'
import { researchSources } from '../data/sources'

export type EvidenceKind = 'nasa-source' | 'project-interpretation' | 'illustrative'

const kindLabels: Record<EvidenceKind, string> = {
  'nasa-source': 'NASA SOURCE',
  'project-interpretation': 'PROJECT INTERPRETATION',
  illustrative: 'ILLUSTRATIVE',
}

const kindIcons = {
  'nasa-source': Microscope,
  'project-interpretation': Info,
  illustrative: Sparkles,
} satisfies Record<EvidenceKind, typeof Info>

interface EvidenceCalloutProps {
  kind: EvidenceKind
  title: string
  children: string
  sourceIds?: string[]
}

export function EvidenceCallout({ kind, title, children, sourceIds = [] }: EvidenceCalloutProps) {
  const Icon = kindIcons[kind]
  const sources = sourceIds
    .map((sourceId) => researchSources.find((source) => source.id === sourceId))
    .filter((source) => source !== undefined)

  return (
    <aside aria-label={`${kindLabels[kind]}: ${title}`} className={`evidence-callout evidence-callout-${kind}`}>
      <Icon aria-hidden="true" size={16} />
      <div className="evidence-callout-copy">
        <span className="evidence-callout-label">{kindLabels[kind]}</span>
        <strong>{title}</strong>
        <p>{children}</p>
        {sources.length > 0 && (
          <div className="evidence-callout-sources">
            {sources.map((source) => (
              <a href={source.url} key={source.id} rel="noreferrer" target="_blank">
                {source.id} · {source.title}<ArrowUpRight aria-hidden="true" size={12} />
              </a>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
