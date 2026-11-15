import { useState } from 'react'
import { Atom, Info } from 'lucide-react'

export function MicrogravityLabPage() {
  const [gravity, setGravity] = useState<'Earth gravity' | 'Microgravity'>('Microgravity')
  const [oxygen, setOxygen] = useState(21)
  const [airflow, setAirflow] = useState(0)
  const [fuel, setFuel] = useState('Conceptual solid fuel')

  return (
    <div className="page-content tool-page">
      <header className="tool-page-header">
        <div><span className="section-kicker">EDUCATIONAL VISUALIZATION</span><h1>Microgravity lab</h1><p>Explore conceptual differences discussed in combustion research. Controls do not produce physical predictions.</p></div>
        <span className="assistant-mode"><Atom size={16} /> ILLUSTRATIVE ONLY</span>
      </header>
      <div className="lab-layout">
        <section className="panel lab-controls">
          <div className="panel-heading"><div><span className="section-kicker">DISPLAY CONTROLS</span><h2>Illustration parameters</h2></div></div>
          <label className="select-field">Gravity condition<select onChange={(event) => setGravity(event.target.value as typeof gravity)} value={gravity}><option>Microgravity</option><option>Earth gravity</option></select></label>
          <label className="range-field">Oxygen setting <output>{oxygen}%</output><input max="35" min="10" onChange={(event) => setOxygen(Number(event.target.value))} type="range" value={oxygen} /></label>
          <label className="range-field">Airflow setting <output>{airflow}%</output><input max="100" min="0" onChange={(event) => setAirflow(Number(event.target.value))} type="range" value={airflow} /></label>
          <label className="select-field">Illustration label<select onChange={(event) => setFuel(event.target.value)} value={fuel}><option>Conceptual solid fuel</option><option>Conceptual gaseous fuel</option><option>Conceptual droplet fuel</option></select></label>
          <p className="control-footnote"><Info size={14} /> Values change the diagram label only. They are not experimental inputs or a validated model.</p>
        </section>
        <section className="panel lab-visual-panel">
          <div className="panel-heading"><div><span className="section-kicker">CONCEPTUAL FLAME DIAGRAM</span><h2>{gravity}</h2></div><span className="library-kind">NOT TO SCALE</span></div>
          <div className={`lab-stage ${gravity === 'Microgravity' ? 'lab-microgravity' : 'lab-earth'}`}>
            <div className="lab-orbit-ring" /><div className={`concept-flame ${gravity === 'Microgravity' ? 'concept-flame-round' : 'concept-flame-tapered'}`}><span /></div>
            <div className="fuel-sample" />
            {gravity === 'Earth gravity' && <div className="convection-arrows" aria-hidden="true"><span>↑</span><span>↑</span><span>↑</span></div>}
            <span className="lab-label label-gravity">{gravity.toUpperCase()}</span><span className="lab-label label-fuel">{fuel}</span>
          </div>
          <div className="lab-legend"><span><i className="legend-flame" /> Conceptual flame shape</span><span><i className="legend-flow" /> {gravity === 'Earth gravity' ? 'Convection concept' : 'Diffusion concept'}</span></div>
          <p className="panel-description">Illustration varies only by selected gravity label. Real flame behavior depends on experimental geometry, fuel, oxygen, flow, pressure, and other conditions not modeled here.</p>
        </section>
      </div>
      <aside className="evidence-boundary"><Info size={16} /><p>Educational illustration — not NASA measurements, a scientific simulation, or a fire-safety prediction. See the linked research sources for experimental evidence.</p></aside>
    </div>
  )
}
