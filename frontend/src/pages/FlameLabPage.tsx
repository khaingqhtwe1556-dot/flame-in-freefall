import { lazy, Suspense, useState } from 'react'
import { Info, Pause, Play, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { initialFlameSettings, type FlameSettings } from '../types/flame'

const FlameScene = lazy(() =>
  import('../components/FlameScene').then((module) => ({ default: module.FlameScene })),
)

export function FlameLabPage() {
  const [settings, setSettings] = useState<FlameSettings>(initialFlameSettings)
  const update = <Key extends keyof FlameSettings>(key: Key, value: FlameSettings[Key]) => {
    setSettings((current) => ({ ...current, [key]: value }))
  }
  const explanation = settings.gravity === 'microgravity' && settings.fuel === 'Liquid droplet'
    ? 'Droplet-inspired concept: a central liquid sphere sits inside layered orange glow. These are illustrative colors, not measured NASA data or a validated FLEX model.'
    : settings.gravity === 'microgravity'
      ? 'With buoyancy weakened, this concept illustration becomes more rounded. Oxygen and flow settings change its appearance only.'
      : 'This illustration narrows upward to suggest buoyant flow. The shape is not calculated from measured combustion conditions.'

  function reset() {
    setSettings({ ...initialFlameSettings })
  }

  return (
    <div className="page-content tool-page">
      <header className="tool-page-header">
        <div><span className="section-kicker">INTERACTIVE SCIENCE EXPERIENCE</span><h1>3D flame lab</h1><p>Rotate a conceptual flame and explore how display parameters reshape the illustration.</p></div>
        <span className="assistant-mode"><i className="sim-status-dot" /> EDUCATIONAL SIMULATION</span>
      </header>
      <div className="flame-lab-layout">
        <section className="panel flame-control-panel">
          <div className="panel-heading"><div><span className="section-kicker">SCENE PARAMETERS</span><h2>Adjust the visualization</h2></div></div>
          <label className="select-field">Gravity mode<select onChange={(event) => update('gravity', event.target.value as FlameSettings['gravity'])} value={settings.gravity}><option value="earth">Earth gravity concept</option><option value="microgravity">Microgravity concept</option></select></label>
          <label className="select-field">Fuel type<select onChange={(event) => update('fuel', event.target.value)} value={settings.fuel}><option>Gaseous fuel</option><option>Liquid droplet</option><option>Solid fuel</option><option>Hydrogen concept</option></select></label>
          <label className="range-field">Oxygen setting <output>{settings.oxygen}%</output><input max="35" min="10" onChange={(event) => update('oxygen', Number(event.target.value))} type="range" value={settings.oxygen} /></label>
          <label className="range-field">Airflow setting <output>{settings.airflow}%</output><input max="100" min="0" onChange={(event) => update('airflow', Number(event.target.value))} type="range" value={settings.airflow} /></label>
          <label className="range-field">Temperature display <output>{settings.temperature} K</output><input max="1400" min="300" onChange={(event) => update('temperature', Number(event.target.value))} step="10" type="range" value={settings.temperature} /></label>
          <div className="scene-transport" aria-label="Animation controls">
            <button aria-label={settings.playing ? 'Pause animation' : 'Start animation'} className="button-primary" onClick={() => update('playing', !settings.playing)} type="button">{settings.playing ? <Pause size={15} /> : <Play size={15} />}{settings.playing ? 'Pause' : 'Start'}</button>
            <button className="button-secondary" onClick={reset} type="button"><RotateCcw size={14} /> Reset</button>
          </div>
        </section>
        <section className="panel flame-display-panel">
          <div className="panel-heading"><div><span className="section-kicker">LIVE SCENE · DRAG TO ORBIT</span><h2>{settings.gravity === 'earth' ? 'Earth gravity concept' : settings.fuel === 'Liquid droplet' ? 'Microgravity droplet concept' : 'Microgravity concept'}</h2></div><span className="scene-live"><i className={settings.playing ? 'live' : ''} />{settings.playing ? 'RUNNING' : 'PAUSED'}</span></div>
          <Suspense fallback={<div className="scene-loading" role="status">Preparing 3D scene…</div>}>
            <FlameScene label="Interactive illustrative 3D flame. Drag to rotate and use controls to zoom." settings={settings} />
          </Suspense>
          <div className="scene-parameter-strip"><span>O₂ <strong>{settings.oxygen}%</strong></span><span>FLOW <strong>{settings.airflow}%</strong></span><span>TEMP <strong>{settings.temperature} K*</strong></span><span>FUEL <strong>{settings.fuel}</strong></span></div>
          <p className="scene-explanation">{explanation}</p>
        </section>
      </div>
      <aside className="evidence-boundary"><Info size={16} /><p>Conceptual 3D visualization only. Slider values are illustrative controls, not experimental inputs or a validated physical model. No output is NASA measurement data or a fire-risk prediction.</p></aside>
      <Link className="text-link" to="/concept-lab">Open the simpler flame concept diagram</Link>
    </div>
  )
}
