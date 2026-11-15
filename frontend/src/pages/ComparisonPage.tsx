import { useMemo, useState } from 'react'
import { ArrowUpRight, GitCompareArrows } from 'lucide-react'
import { investigations } from '../data/investigations'

const initialSelection = ['PSI-98', 'PSI-69']

export function ComparisonPage() {
  const [selectedIds, setSelectedIds] = useState(initialSelection)
  const selected = useMemo(
    () => investigations.filter(({ accession }) => selectedIds.includes(accession)),
    [selectedIds],
  )

  function toggle(accession: string) {
    setSelectedIds((current) => {
      if (current.includes(accession)) return current.filter((id) => id !== accession)
      return current.length < 3 ? [...current, accession] : current
    })
  }

  const rows = [
    { label: 'Objective', value: (item: (typeof investigations)[number]) => item.objective },
    { label: 'Category', value: (item: (typeof investigations)[number]) => item.category.replaceAll('-', ' ') },
    { label: 'Gravity context', value: (item: (typeof investigations)[number]) => item.gravityContext },
    { label: 'Fuels / materials', value: (item: (typeof investigations)[number]) => item.fuelsAndMaterials?.join(', ') ?? 'Not established in curated metadata' },
    { label: 'Listed formats', value: (item: (typeof investigations)[number]) => item.formats.join(', ') || 'Not listed' },
    { label: 'File-list entries', value: (item: (typeof investigations)[number]) => `${item.listedFileEntries.toLocaleString()} (metadata only)` },
    { label: 'Availability', value: (item: (typeof investigations)[number]) => item.availability === 'metadata-files-unverified' ? 'Files not verified' : item.availability },
    { label: 'Safety relationship', value: (item: (typeof investigations)[number]) => item.safetyRelationship },
  ]

  return (
    <div className="page-content tool-page">
      <header className="tool-page-header">
        <div><span className="section-kicker">EXPERIMENT INTELLIGENCE</span><h1>Compare investigations</h1><p>Select up to three records to compare curated metadata side by side.</p></div>
        <span className="library-count"><GitCompareArrows size={16} /> {selected.length} SELECTED</span>
      </header>
      <section className="panel tool-panel">
        <div className="panel-heading"><div><span className="section-kicker">SELECTION</span><h2>Choose investigations</h2></div><span className="small-muted">Up to 3 records</span></div>
        <div className="compare-picker">
          {investigations.map((item) => (
            <label className={`compare-option ${selectedIds.includes(item.accession) ? 'compare-option-selected' : ''}`} key={item.accession}>
              <input checked={selectedIds.includes(item.accession)} disabled={!selectedIds.includes(item.accession) && selectedIds.length >= 3} onChange={() => toggle(item.accession)} type="checkbox" />
              <span><strong>{item.acronym}</strong><small>{item.accession} · {item.title}</small></span>
            </label>
          ))}
        </div>
      </section>
      <section className="panel tool-panel comparison-table-panel">
        <div className="panel-heading"><div><span className="section-kicker">METADATA MATRIX</span><h2>Side-by-side comparison</h2></div></div>
        {selected.length < 2 ? <div className="empty-state"><GitCompareArrows size={22} /><h2>Select at least two records</h2><p>Choose another investigation above to compare metadata.</p></div> : (
          <div className="comparison-scroll"><table className="comparison-table">
            <thead><tr><th>Attribute</th>{selected.map((item) => <th key={item.accession}>{item.acronym}<small>{item.accession}</small></th>)}</tr></thead>
            <tbody>
              <tr><th>Record</th>{selected.map((item) => <td key={item.accession}><strong>{item.title}</strong><p>{item.summary}</p><a href={item.sourceUrl} rel="noreferrer" target="_blank">NASA record <ArrowUpRight size={12} /></a></td>)}</tr>
              {rows.map(({ label, value }) => <tr key={label}><th>{label}</th>{selected.map((item) => <td key={item.accession}>{value(item)}</td>)}</tr>)}
            </tbody>
          </table></div>
        )}
      </section>
      <p className="tool-disclaimer">Unavailable details remain unknown; file-list counts do not indicate successful downloads or analyzed measurements.</p>
    </div>
  )
}
