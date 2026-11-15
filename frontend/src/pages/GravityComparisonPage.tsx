import { lazy, Suspense, useState } from 'react'
import { Info, Pause, Play, RotateCcw } from 'lucide-react'
import { initialFlameSettings, type FlameSettings } from '../types/flame'
import { getGravityExplanation } from '../services/gravityExplanation'
import { EvidenceCallout } from '../components/EvidenceCallout'

const FlameScene = lazy(() =>
  import('../components/FlameScene').then((module) => ({ default: module.FlameScene })),
)

export function GravityComparisonPage() {
  const [shared, setShared] = useState(initialFlameSettings)
  const earthSettings: FlameSettings = { ...shared, gravity: 'earth' }
  const microgravitySettings: FlameSettings = { ...shared, gravity: 'microgravity' }
  const update = (key: 'oxygen' | 'airflow', value: number) => {
    setShared((current) => ({ ...current, [key]: value }))
  }

  return (
    <div className="page-content tool-page">
      <header className="tool-page-header">
        <div><span className="section-kicker">SIDE-BY-SIDE CONCEPTS</span><h1>Earth vs microgravity</h1><p>Compare two illustrative flame shapes with synchronized animation and shared display controls.</p></div>
        <span className="assistant-mode">ILLUSTRATIVE · NOT MEASURED</span>
      </header>
      <div className="comparison-controls panel">
        <label className="range-field">Shared oxygen <output>{shared.oxygen}%</output><input max="35" min="10" onChange={(event) => update('oxygen', Number(event.target.value))} type="range" value={shared.oxygen} /></label>
        <label className="range-field">Shared airflow <output>{shared.airflow}%</output><input max="100" min="0" onChange={(event) => update('airflow', Number(event.target.value))} type="range" value={shared.airflow} /></label>
        <div className="scene-transport">
          <button className="button-primary" onClick={() => setShared((current) => ({ ...current, playing: !current.playing }))} type="button">{shared.playing ? <Pause size={14} /> : <Play size={14} />}{shared.playing ? 'Pause both' : 'Start both'}</button>
          <button className="button-secondary" onClick={() => setShared({ ...initialFlameSettings })} type="button"><RotateCcw size={14} /> Reset</button>
        </div>
      </div>
      <div className="gravity-scenes">
        {[{ id: 'earth', title: 'Earth gravity', settings: earthSettings }, { id: 'microgravity', title: 'Microgravity', settings: microgravitySettings }].map(({ id, title, settings }) => (
          <section className="panel gravity-scene-card" key={id}>
            <div className="panel-heading"><div><span className="section-kicker">{id === 'earth' ? '1 g CONCEPT' : 'LOW-g CONCEPT'}</span><h2>{title}</h2></div><span className={`gravity-symbol gravity-symbol-${id}`} /></div>
            <Suspense fallback={<div className="scene-loading" role="status">Preparing comparison view…</div>}>
              <FlameScene label={`${title} conceptual flame visualization`} settings={settings} />
            </Suspense>
            <p>{getGravityExplanation(settings.gravity, settings.oxygen, settings.airflow)}</p>
          </section>
        ))}
      </div>
      <EvidenceCallout kind="project-interpretation" title="How to read this comparison" sourceIds={['S2', 'S4']}>
        NASA sources provide combustion research context. The shapes and slider responses are project-created illustrations, not experimentally validated outputs.
      </EvidenceCallout>
      <aside className="evidence-boundary"><Info size={16} /><p>The scenes share animation and slider values but are not coupled to a physical solver. Actual flame shape depends on experiment geometry, fuel, oxidizer, pressure, flow, and boundary conditions.</p></aside>
    </div>
  )
}
