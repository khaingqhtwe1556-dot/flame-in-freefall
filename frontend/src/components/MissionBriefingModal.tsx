import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Info, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { initialFlameSettings } from '../types/flame'
import type { FlameSettings } from '../types/flame'
import { EvidenceCallout } from './EvidenceCallout'
import { getGravityExplanation } from '../services/gravityExplanation'
import { missionBriefingSteps, moveBriefingStep } from '../services/missionBriefing'

const FlameScene = lazy(() =>
  import('./FlameScene').then((module) => ({ default: module.FlameScene })),
)

interface MissionBriefingModalProps {
  onClose: () => void
}

export function MissionBriefingModal({ onClose }: MissionBriefingModalProps) {
  const [step, setStep] = useState(0)
  const [settings, setSettings] = useState<FlameSettings>(initialFlameSettings)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const progress = ((step + 1) / missionBriefingSteps.length) * 100

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const dialog = document.querySelector<HTMLElement>('[data-mission-briefing-dialog]')
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
    }
  }, [onClose])

  function update<Key extends keyof FlameSettings>(key: Key, value: FlameSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  function renderStep() {
    if (step === 0) {
      return (
        <div className="briefing-intro">
          <span className="section-kicker">THE QUESTION</span>
          <h3>What changes when combustion happens away from Earth?</h3>
          <p>Start with a question, follow the research trail, and explore a conceptual comparison. This briefing is an orientation to the project—not a summary of experiment results.</p>
          <EvidenceCallout kind="project-interpretation" title="A question to investigate" sourceIds={['S2', 'S4']}>
            NASA program and technical-guide sources provide context for combustion research. This project uses them to frame a question, not to claim a specific measured result.
          </EvidenceCallout>
        </div>
      )
    }

    if (step === 1) {
      return (
        <div className="briefing-evidence">
          <span className="section-kicker">NASA CONTEXT</span>
          <h3>What the reviewed sources establish</h3>
          <p>The reviewed NASA pages describe combustion-science program context, facilities, experiment families, and technical or historical context. Use the original pages for their full detail.</p>
          <EvidenceCallout kind="nasa-source" title="Program and technical context" sourceIds={['S2', 'S4']}>
            These source descriptions identify program, facility, experiment-family, technical, and historical context. The briefing does not add unpublished or unverified measurements.
          </EvidenceCallout>
          <EvidenceCallout kind="nasa-source" title="Repository records are metadata" sourceIds={['S1']}>
            PSI search records and file inventories are not proof that raw files were downloaded, opened, or analyzed for this project.
          </EvidenceCallout>
        </div>
      )
    }

    if (step === 2) {
      return (
        <div className="briefing-exploration">
          <div className="briefing-intro">
            <span className="section-kicker">EXPLORE A CONCEPT</span>
            <h3>Compare the visual idea</h3>
            <p>Switch gravity concepts and tune the display. Changes affect this illustration only.</p>
          </div>
          <div className="briefing-scene">
            <Suspense fallback={<div className="scene-loading" role="status">Preparing the illustrative view…</div>}>
              <FlameScene label="Illustrative flame visualization for the mission briefing" settings={settings} />
            </Suspense>
          </div>
          <div className="briefing-controls">
            <label>
              Gravity concept
              <select onChange={(event) => update('gravity', event.target.value as FlameSettings['gravity'])} value={settings.gravity}>
                <option value="earth">Earth gravity</option>
                <option value="microgravity">Microgravity</option>
              </select>
            </label>
            <label>
              Oxygen display <output>{settings.oxygen}%</output>
              <input max="35" min="10" onChange={(event) => update('oxygen', Number(event.target.value))} type="range" value={settings.oxygen} />
            </label>
            <label>
              Airflow display <output>{settings.airflow}%</output>
              <input max="100" min="0" onChange={(event) => update('airflow', Number(event.target.value))} type="range" value={settings.airflow} />
            </label>
          </div>
          <p className="briefing-dynamic-explanation">{getGravityExplanation(settings.gravity, settings.oxygen, settings.airflow)}</p>
          <EvidenceCallout kind="illustrative" title="Conceptual visualization" sourceIds={['S2', 'S4']}>
            These sources offer research context, not validation of this graphic. It is not a physical solver or NASA experimental output.
          </EvidenceCallout>
        </div>
      )
    }

    return (
      <div className="briefing-limits">
        <span className="section-kicker">WHAT REMAINS UNKNOWN</span>
        <h3>Keep evidence and illustration distinct</h3>
        <p>Project interpretations can suggest questions for further research, but they do not establish mission-specific fire behavior or certify a habitat design.</p>
        <EvidenceCallout kind="illustrative" title="Limits of this experience" sourceIds={['S1', 'S2', 'S4']}>
          Repository metadata is not analyzed raw data. The interactive scene is illustrative. Neither the scene nor this briefing provides a fire-risk estimate or operational safety guidance.
        </EvidenceCallout>
        <div className="briefing-next-links">
          <Link className="button-secondary" to="/explorer">Browse NASA records <ArrowRight size={14} /></Link>
          <Link className="button-secondary" to="/gravity">Open full comparison <ArrowRight size={14} /></Link>
          <Link className="button-secondary" to="/emergency">Try a fictional scenario <ArrowRight size={14} /></Link>
        </div>
        <p className="briefing-signoff"><Info aria-hidden="true" size={14} /> For scientific claims, follow the linked NASA sources.</p>
      </div>
    )
  }

  return (
    <div
      className="briefing-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        aria-labelledby="mission-briefing-title"
        aria-modal="true"
        className="mission-briefing-dialog"
        data-mission-briefing-dialog
        role="dialog"
        tabIndex={-1}
      >
        <header className="briefing-header">
          <div>
            <span className="section-kicker">FLAMEGUARD SI · VISITOR ORIENTATION</span>
            <h2 id="mission-briefing-title">Mission briefing</h2>
          </div>
          <button aria-label="Close mission briefing" className="icon-button" onClick={onClose} ref={closeButtonRef} type="button"><X size={18} /></button>
        </header>
        <div aria-label={`Step ${step + 1} of ${missionBriefingSteps.length}`} className="briefing-stepper">
          <div aria-valuemax={100} aria-valuemin={0} aria-valuenow={progress} className="briefing-progress" role="progressbar"><span style={{ width: `${progress}%` }} /></div>
          <div className="briefing-step-labels">
            {missionBriefingSteps.map((item, index) => (
              <span aria-current={index === step ? 'step' : undefined} key={item.id}>{String(index + 1).padStart(2, '0')} · {item.label}</span>
            ))}
          </div>
        </div>
        <div className="briefing-content" key={missionBriefingSteps[step].id}>
          {renderStep()}
        </div>
        <footer className="briefing-footer">
          <button className="button-secondary" disabled={step === 0} onClick={() => setStep((current) => moveBriefingStep(current, -1))} type="button"><ArrowLeft size={14} /> Back</button>
          <span>STEP {step + 1} / {missionBriefingSteps.length}</span>
          {step === missionBriefingSteps.length - 1
            ? <button className="button-primary" onClick={onClose} type="button">Finish briefing</button>
            : <button className="button-primary" onClick={() => setStep((current) => moveBriefingStep(current, 1))} type="button">Continue <ArrowRight size={14} /></button>}
        </footer>
      </section>
    </div>
  )
}
