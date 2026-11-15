import { useMemo, useState } from 'react'
import {
  ArrowUpDown,
  ExternalLink,
  FileSearch,
  FilterX,
  Search,
  ShieldAlert,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import {
  availabilityLabels,
  categoryLabels,
  gravityLabels,
  investigations,
  PSI_SEARCH_URL,
} from '../data/investigations'
import { AvailabilityBadge, InvestigationCard } from '../components/ResearchComponents'
import type { AvailabilityStatus, GravityContext, Investigation, ResearchCategory } from '../types/research'

type SortOrder = 'relevance' | 'accession' | 'file-count'

const categoryOptions = Object.entries(categoryLabels) as [ResearchCategory, string][]
const gravityOptions = Object.entries(gravityLabels) as [GravityContext, string][]
const statusOptions = Object.entries(availabilityLabels) as [AvailabilityStatus, string][]
const formatOptions = [...new Set(investigations.flatMap((record) => record.formats))].sort()

function DetailPanel({ investigation }: { investigation: Investigation }) {
  return (
    <aside aria-label={`${investigation.acronym} investigation details`} className="detail-panel">
      <div className="detail-header">
        <div>
          <span className="accession-label">{investigation.accession}</span>
          <h2>{investigation.acronym}</h2>
        </div>
        <FileSearch className="detail-icon" size={20} />
      </div>
      <p className="detail-title">{investigation.title}</p>
      <p className="detail-summary">{investigation.summary}</p>
      <div className="detail-section">
        <span className="detail-label">RESEARCH OBJECTIVE</span>
        <p>{investigation.objective}</p>
      </div>
      <div className="detail-grid">
        <div>
          <span className="detail-label">GRAVITY CONTEXT</span>
          <strong>{gravityLabels[investigation.gravityContext]}</strong>
        </div>
        <div>
          <span className="detail-label">PSI FILE-LIST ENTRIES</span>
          <strong>{investigation.listedFileEntries.toLocaleString()}</strong>
        </div>
      </div>
      <div className="detail-section">
        <span className="detail-label">FUELS / MATERIALS</span>
        <div className="detail-chip-list">
          {(investigation.fuelsAndMaterials ?? ['Not specified in reviewed summary']).map((item) => (
            <span className="detail-chip" key={item}>{item}</span>
          ))}
        </div>
      </div>
      <div className="detail-section">
        <span className="detail-label">FORMATS IN INVENTORY SUMMARY</span>
        <div className="detail-chip-list">
          {investigation.formats.map((format) => (
            <span className="format-chip" key={format}>{format}</span>
          ))}
        </div>
        <small className="detail-footnote">Leading listed types only; the inventory is not a validated schema.</small>
      </div>
      <div className="detail-status-box">
        <AvailabilityBadge status={investigation.availability} />
        <p>
          The PSI record lists file entries, but the raw files have not been
          downloaded or checked for access, contents, units, or parsing requirements.
        </p>
      </div>
      <a className="button-outline external-source-button" href={PSI_SEARCH_URL} rel="noreferrer" target="_blank">
        Open NASA PSI search <ExternalLink size={15} />
      </a>
      <p className="source-id-note">Source {investigation.sourceId} <span>·</span> Search PSI for accession <strong>{investigation.accession}</strong>.</p>
    </aside>
  )
}

export function ExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState('')
  const [gravity, setGravity] = useState('')
  const [fuelMaterial, setFuelMaterial] = useState('')
  const [format, setFormat] = useState('')
  const [availability, setAvailability] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('relevance')
  const [selectedAccession, setSelectedAccession] = useState(investigations[0].accession)
  const search = searchParams.get('q') ?? ''

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const results = investigations.filter((item) => {
      const searchable = [
        item.accession,
        item.title,
        item.acronym,
        item.summary,
        item.objective,
        ...(item.fuelsAndMaterials ?? []),
        categoryLabels[item.category],
      ].join(' ').toLocaleLowerCase()
      return (
        (!query || searchable.includes(query)) &&
        (!category || item.category === category) &&
        (!gravity || item.gravityContext === gravity) &&
        (!fuelMaterial ||
          (item.fuelsAndMaterials ?? []).some((value) =>
            value.toLocaleLowerCase().includes(fuelMaterial.trim().toLocaleLowerCase()),
          )) &&
        (!format || item.formats.includes(format)) &&
        (!availability || item.availability === availability)
      )
    })

    if (sortOrder === 'accession') {
      return [...results].sort((a, b) => a.accession.localeCompare(b.accession))
    }
    if (sortOrder === 'file-count') {
      return [...results].sort((a, b) => b.listedFileEntries - a.listedFileEntries)
    }
    return results
  }, [availability, category, format, fuelMaterial, gravity, search, sortOrder])

  const selected =
    filtered.find((item) => item.accession === selectedAccession) ??
    filtered[0] ??
    investigations[0]

  const hasFilters = Boolean(search || category || gravity || fuelMaterial || format || availability)

  function resetFilters() {
    setCategory('')
    setGravity('')
    setFuelMaterial('')
    setFormat('')
    setAvailability('')
    setSearchParams({})
  }

  return (
    <div className="page-content explorer-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> NASA PSI · SOURCE-ATTRIBUTED CATALOG</div>
          <h1>NASA Data Explorer</h1>
          <p>Search investigations and inspect what the reviewed metadata actually supports.</p>
        </div>
        <div className="catalog-count">
          <strong>{filtered.length.toString().padStart(2, '0')}</strong>
          <span>of {investigations.length} records</span>
        </div>
      </div>

      <div className="explorer-banner">
        <ShieldAlert size={18} />
        <p><strong>Metadata is not the dataset.</strong> PSI file inventories are listed below, but file access and raw contents remain unverified.</p>
      </div>

      <div className="explorer-layout">
        <section className="explorer-results">
          <div className="filter-panel">
            <label className="explorer-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search investigations</span>
              <input
                onChange={(event) => {
                  setSearchParams(event.target.value ? { q: event.target.value } : {}, { replace: true })
                }}
                placeholder="Search title, accession, fuel, objective..."
                value={search}
              />
            </label>
            <div className="filter-grid">
              <label className="filter-field">
                <span>Research topic</span>
                <select onChange={(event) => setCategory(event.target.value)} value={category}>
                  <option value="">All topics</option>
                  {categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="filter-field">
                <span>Gravity context</span>
                <select onChange={(event) => setGravity(event.target.value)} value={gravity}>
                  <option value="">All contexts</option>
                  {gravityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="filter-field">
                <span>Fuel / material</span>
                <input
                  onChange={(event) => setFuelMaterial(event.target.value)}
                  placeholder="e.g. methane, solid"
                  value={fuelMaterial}
                />
              </label>
              <label className="filter-field">
                <span>Listed format</span>
                <select onChange={(event) => setFormat(event.target.value)} value={format}>
                  <option value="">All formats</option>
                  {formatOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="filter-field">
                <span>Availability status</span>
                <select onChange={(event) => setAvailability(event.target.value)} value={availability}>
                  <option value="">All statuses</option>
                  {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>
            <div className="filter-footer">
              <span>{hasFilters ? `${filtered.length} matching records` : 'Showing all reviewed records'}</span>
              <div className="filter-actions">
                {hasFilters && (
                  <button className="clear-filters" onClick={resetFilters} type="button">
                    <FilterX size={14} /> Clear filters
                  </button>
                )}
                <label className="sort-control">
                  <ArrowUpDown size={14} />
                  <span className="sr-only">Sort results</span>
                  <select onChange={(event) => setSortOrder(event.target.value as SortOrder)} value={sortOrder}>
                    <option value="relevance">Curated order</option>
                    <option value="accession">Accession</option>
                    <option value="file-count">Listed entries</option>
                    <option disabled value="date">Date (not in reviewed snapshot)</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          {filtered.length ? (
            <div className="investigation-grid">
              {filtered.map((item) => (
                <InvestigationCard
                  investigation={item}
                  key={item.accession}
                  onSelect={(record) => setSelectedAccession(record.accession)}
                  selected={selectedAccession === item.accession}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={24} />
              <h2>No investigations match</h2>
              <p>Try a broader search or remove one of the filters.</p>
              <button className="button-secondary" onClick={resetFilters} type="button">Reset filters</button>
            </div>
          )}
        </section>

        {filtered.length > 0 && <DetailPanel investigation={selected} />}
      </div>
      <footer className="page-footer">
        <span>Inventory snapshot reviewed 2026-11-14</span>
        <span>Record dates not reviewed <span className="footer-dot">·</span> Source: NASA PSI <a href={PSI_SEARCH_URL} rel="noreferrer" target="_blank">Open source <ExternalLink size={11} /></a></span>
      </footer>
    </div>
  )
}
