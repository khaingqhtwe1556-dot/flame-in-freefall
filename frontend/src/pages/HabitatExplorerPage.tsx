import { lazy, Suspense, useState } from 'react'
import { ArrowUpRight, Info } from 'lucide-react'
import { researchSources } from '../data/sources'
import type { HabitatZone } from '../components/HabitatScene'

const HabitatScene = lazy(() =>
  import('../components/HabitatScene').then((module) => ({ default: module.HabitatScene })),
)

const zones: { id: HabitatZone; label: string; detail: string; sourceIds: string[] }[] = [
  { id: 'crew', label: 'Crew sleeping area', detail: 'A conceptual crew zone for discussing material selection, detection coverage, and response visibility. This model does not specify a real habitat layout.', sourceIds: ['S5', 'S7'] },
  { id: 'laboratory', label: 'Laboratory', detail: 'Research spaces raise questions about ignition sources, test articles, and local sensing. Review experiment metadata before transferring findings.', sourceIds: ['S1', 'S2', 'S4'] },
  { id: 'oxygen', label: 'Oxygen supply', detail: 'Oxygen-system reliability is a historical safety topic. This clickable module is conceptual and does not model flow, storage, or failure behavior.', sourceIds: ['S6', 'S7'] },
  { id: 'electrical', label: 'Electrical system', detail: 'Electrical equipment is shown as a discussion point for ignition prevention and isolation planning, not as a modeled component.', sourceIds: ['S5', 'S7'] },
  { id: 'detection', label: 'Fire detection', detail: 'Detection concepts can be compared with NASA-linked technology transfer and combustion research; this model contains no sensor performance data.', sourceIds: ['S4', 'S9'] },
  { id: 'exit', label: 'Emergency egress', detail: 'Egress and crew coordination are important historical themes. This illustration is not an official habitat design or response procedure.', sourceIds: ['S5', 'S7'] },
]

export function HabitatExplorerPage() {
  const [mission, setMission] = useState<'Moon' | 'Mars'>('Moon')
  const [selected, setSelected] = useState<HabitatZone>('detection')
  const activeZone = zones.find(({ id }) => id === selected) ?? zones[0]
  const citations = activeZone.sourceIds.flatMap((id) => {
    const source = researchSources.find((item) => item.id === id)
    return source ? [source] : []
  })

  return (
    <div className="page-content tool-page">
      <header className="tool-page-header">
        <div><span className="section-kicker">CONCEPTUAL ENVIRONMENT · DRAG TO ORBIT</span><h1>{mission} habitat explorer</h1><p>Select a module to view evidence-linked research context and open source references.</p></div>
        <span className="assistant-mode">NOT AN OFFICIAL DESIGN</span>
      </header>
      <div className="mission-switch" role="tablist" aria-label="Select conceptual habitat">
        {(['Moon', 'Mars'] as const).map((body) => <button aria-selected={mission === body} className={mission === body ? 'mission-switch-active' : ''} key={body} onClick={() => setMission(body)} role="tab" type="button">{body} concept</button>)}
      </div>
      <div className="habitat-layout">
        <section className="panel habitat-scene-panel">
          <div className="panel-heading"><div><span className="section-kicker">CONCEPTUAL 3D HABITAT</span><h2>{mission} exploration module</h2></div><span className="scene-live"><i className="live" /> INTERACTIVE</span></div>
          <Suspense fallback={<div className="scene-loading" role="status">Preparing habitat view…</div>}>
            <HabitatScene mission={mission} onSelect={setSelected} selected={selected} />
          </Suspense>
          <div className="habitat-zone-selector" aria-label="Habitat areas">
            {zones.map(({ id, label }) => <button aria-pressed={selected === id} className={selected === id ? 'habitat-zone-selected' : ''} key={id} onClick={() => setSelected(id)} type="button">{label}</button>)}
          </div>
        </section>
        <aside className="panel habitat-info-panel">
          <span className="section-kicker">SELECTED SYSTEM</span>
          <h2>{activeZone.label}</h2>
          <p>{activeZone.detail}</p>
          <div className="habitat-source-list">
            <strong>Related references</strong>
            {citations.map((source) => <a href={source.url} key={source.id} rel="noreferrer" target="_blank"><span>{source.title}</span><ArrowUpRight size={14} /></a>)}
          </div>
          <div className="habitat-caveat"><Info size={15} /><span>References provide context only; none validates this habitat concept or its safety.</span></div>
        </aside>
      </div>
      <aside className="evidence-boundary"><Info size={16} /><p>Conceptual visual only, not an official NASA habitat design. Layout and selectable areas are project-created; cited sources are historical or research context, not design requirements.</p></aside>
    </div>
  )
}
