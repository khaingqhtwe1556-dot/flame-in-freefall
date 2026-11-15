import { AlertCircle, ArrowUpRight, FileText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { availabilityLabels, categoryLabels, gravityLabels } from '../data/investigations'
import type { AvailabilityStatus, Investigation } from '../types/research'

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = 'blue',
}: {
  label: string
  value: string
  note: string
  icon: LucideIcon
  tone?: 'blue' | 'cyan' | 'green' | 'orange'
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}>
        <Icon size={18} />
      </div>
      <div className="stat-copy">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        <span className="stat-note">{note}</span>
      </div>
    </article>
  )
}

export function AvailabilityBadge({
  status,
}: {
  status: AvailabilityStatus
}) {
  const isUnverified = status !== 'documentation-only'
  return (
    <span className={`availability-badge ${isUnverified ? 'badge-pending' : 'badge-docs'}`}>
      {isUnverified ? <AlertCircle size={13} /> : <FileText size={13} />}
      {availabilityLabels[status]}
    </span>
  )
}

export function InvestigationCard({
  investigation,
  selected = false,
  onSelect,
}: {
  investigation: Investigation
  selected?: boolean
  onSelect: (investigation: Investigation) => void
}) {
  return (
    <button
      aria-pressed={selected}
      className={`investigation-card ${selected ? 'investigation-card-selected' : ''}`}
      onClick={() => onSelect(investigation)}
      type="button"
    >
      <div className="investigation-card-top">
        <span className="accession-label">{investigation.accession}</span>
        <ArrowUpRight size={16} className="card-arrow" />
      </div>
      <h3>{investigation.acronym}</h3>
      <p className="investigation-title">{investigation.title}</p>
      <p className="investigation-summary">{investigation.summary}</p>
      <div className="tag-row">
        <span className="topic-tag">{categoryLabels[investigation.category]}</span>
        <span className="gravity-tag">{gravityLabels[investigation.gravityContext]}</span>
      </div>
      <div className="investigation-card-footer">
        <span>{investigation.listedFileEntries.toLocaleString()} listed entries</span>
        <span className="format-preview">
          {investigation.formats.slice(0, 3).join(' · ')}
        </span>
      </div>
    </button>
  )
}
