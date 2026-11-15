import { useState } from 'react'
import { AlertTriangle, ArrowRight, Info, RotateCcw, ShieldCheck } from 'lucide-react'

interface ResponseChoice {
  label: string
  feedback: string
  coordinated: boolean
}

interface Scenario {
  id: string
  title: string
  subtitle: string
  oxygenContext: string
  thermalEvent: string
  prompts: [string, string, string]
}

const scenarios: Scenario[] = [
  {
    id: 'cargo',
    title: 'Cargo bay smoke alert',
    subtitle: 'A fictional sensor event near stored research equipment.',
    oxygenContext: 'ASSUMED BASELINE',
    thermalEvent: 'ALERT FLAG',
    prompts: ['How does the crew handle the first alert?', 'The alert is acknowledged. What information is reviewed next?', 'Choose a high-level response branch for this training scenario.'],
  },
  {
    id: 'equipment',
    title: 'Equipment bay warning',
    subtitle: 'A fictional temperature warning appears beside a powered unit.',
    oxygenContext: 'NO CHANGE ASSUMED',
    thermalEvent: 'WARNING FLAG',
    prompts: ['The warning appears. What is the first coordination choice?', 'Nearby indicators disagree. What should the scenario team do?', 'Choose how the team continues this fictional event.'],
  },
  {
    id: 'sensor',
    title: 'Sensor disagreement',
    subtitle: 'Two fictional monitors report different conditions.',
    oxygenContext: 'UNCERTAIN',
    thermalEvent: 'SIGNALS DISAGREE',
    prompts: ['A mismatch is reported. How is the event acknowledged?', 'What is the next information-gathering choice?', 'Select a conceptual response branch.'],
  },
]

const responseChoices: ResponseChoice[][] = [
  [
    { label: 'Acknowledge and coordinate with crew', feedback: 'The scenario log records an acknowledged alert and a shared location check.', coordinated: true },
    { label: 'Dismiss without review', feedback: 'The scenario log records no follow-up; the simulated alert remains unresolved.', coordinated: false },
    { label: 'Review available sensor context', feedback: 'The scenario log records a context check before selecting a response.', coordinated: true },
  ],
  [
    { label: 'Compare nearby indicators and report status', feedback: 'The scenario log adds a cross-check and a crew status update.', coordinated: true },
    { label: 'Assume the alert is a sensor fault', feedback: 'The scenario log records an unverified assumption; uncertainty remains high.', coordinated: false },
    { label: 'Continue monitoring while gathering context', feedback: 'The scenario log records continued monitoring and an explicit uncertainty note.', coordinated: true },
  ],
  [
    { label: 'Choose a designated suppression concept', feedback: 'A conceptual suppression branch is selected; this is not a real procedure or equipment recommendation.', coordinated: true },
    { label: 'Keep monitoring and communicate changes', feedback: 'The scenario log records ongoing communication; the event remains unresolved in this branch.', coordinated: true },
    { label: 'Take no further action', feedback: 'The scenario log records a delay; the simulated event remains unresolved.', coordinated: false },
  ],
]

export function EmergencySimulatorPage() {
  const [scenarioId, setScenarioId] = useState(scenarios[0].id)
  const [step, setStep] = useState(0)
  const [choicesMade, setChoicesMade] = useState<ResponseChoice[]>([])
  const [selectedChoice, setSelectedChoice] = useState<ResponseChoice | null>(null)
  const [complete, setComplete] = useState(false)
  const scenario = scenarios.find(({ id }) => id === scenarioId) ?? scenarios[0]
  const progress = complete ? 100 : Math.round((step / scenario.prompts.length) * 100)
  const coordinatedChoices = choicesMade.filter(({ coordinated }) => coordinated).length
  const simulatedImprovement = complete && coordinatedChoices === scenario.prompts.length

  function chooseScenario(id: string) {
    setScenarioId(id)
    setStep(0)
    setChoicesMade([])
    setSelectedChoice(null)
    setComplete(false)
  }

  function chooseResponse(choice: ResponseChoice) {
    setSelectedChoice(choice)
    setChoicesMade((current) => [...current.slice(0, step), choice])
  }

  function continueScenario() {
    if (step === scenario.prompts.length - 1) setComplete(true)
    else {
      setStep((current) => current + 1)
      setSelectedChoice(null)
    }
  }

  function resetScenario() {
    setStep(0)
    setChoicesMade([])
    setSelectedChoice(null)
    setComplete(false)
  }

  return (
    <div className="page-content tool-page">
      <header className="tool-page-header">
        <div><span className="section-kicker">SCENARIO-BASED LEARNING</span><h1>Spacecraft fire emergency</h1><p>Make high-level choices in a fictional onboard event and inspect the scenario log.</p></div>
        <span className="assistant-mode emergency-disclaimer"><AlertTriangle size={14} /> NOT AN OPERATIONAL PROCEDURE</span>
      </header>
      <div className="scenario-picker" aria-label="Select training scenario">
        {scenarios.map((item) => <button aria-pressed={scenario.id === item.id} className={scenario.id === item.id ? 'scenario-selected' : ''} key={item.id} onClick={() => chooseScenario(item.id)} type="button"><strong>{item.title}</strong><span>{item.subtitle}</span></button>)}
      </div>
      <div className="emergency-layout">
        <section className="panel emergency-visual-panel">
          <div className="panel-heading"><div><span className="section-kicker">SIMULATED CABIN STATUS</span><h2>{scenario.title}</h2></div><span className="scenario-tag"><i /> FICTIONAL EVENT</span></div>
          <div className={`cabin-visual ${simulatedImprovement ? 'cabin-improved' : ''}`}>
            <div className="cabin-grid" />
            <div className="cabin-module module-left"><span>MONITOR</span><i /></div>
            <div className="cabin-module module-right"><span>POWER UNIT</span><i /></div>
            <div className="cabin-fire"><span /><i /><b /></div>
            <div className="cabin-smoke smoke-one" /><div className="cabin-smoke smoke-two" /><div className="cabin-smoke smoke-three" />
            <div className="cabin-label cabin-label-alert"><AlertTriangle size={13} /> SENSOR ALERT</div>
            <div className="cabin-label cabin-label-condition">{simulatedImprovement ? 'SIMULATED ALERT LOWERED' : complete ? 'SIMULATED ALERT PERSISTS' : selectedChoice ? 'CREW RESPONSE LOGGED' : 'CONDITION UNRESOLVED'}</div>
          </div>
          <div className="simulated-indicators">
            <div><span>DETECTION</span><strong>ALERT</strong><i className="indicator-alert" /></div>
            <div><span>OXYGEN CONTEXT</span><strong>{scenario.oxygenContext}</strong><i /></div>
            <div><span>THERMAL EVENT</span><strong>{scenario.thermalEvent}</strong><i className="indicator-alert" /></div>
          </div>
          <p className="sim-subtitle">{scenario.subtitle}</p>
        </section>
        <section className="panel decision-panel">
          <div className="panel-heading"><div><span className="section-kicker">DECISION SEQUENCE</span><h2>{complete ? 'Training summary' : `Decision ${step + 1} of ${scenario.prompts.length}`}</h2></div><button aria-label="Reset scenario" className="icon-button" onClick={resetScenario} type="button"><RotateCcw size={16} /></button></div>
          <div className="scenario-progress"><span style={{ width: `${progress}%` }} /></div>
          {!complete ? (
            <>
              <p className="decision-question">{scenario.prompts[step]}</p>
              <div className="decision-options">
                {responseChoices[step].map((choice) => <button aria-pressed={selectedChoice?.label === choice.label} className={selectedChoice?.label === choice.label ? 'decision-selected' : ''} disabled={Boolean(selectedChoice)} key={choice.label} onClick={() => chooseResponse(choice)} type="button"><span className="choice-radio" /><span>{choice.label}</span></button>)}
              </div>
              {selectedChoice && <div className="scenario-feedback" role="status"><Info size={15} /><span>{selectedChoice.feedback}</span></div>}
              <button className="button-primary decision-continue" disabled={!selectedChoice} onClick={continueScenario} type="button">{step === scenario.prompts.length - 1 ? 'View summary' : 'Continue scenario'} <ArrowRight size={14} /></button>
            </>
          ) : (
            <div className="scenario-summary" role="status">
              <span className="summary-icon"><ShieldCheck size={23} /></span>
              <strong>Scenario complete</strong>
              <span className="summary-score">{coordinatedChoices} / {scenario.prompts.length} coordinated choices</span>
              <p>This project-defined tally summarizes your selected branches only. It is not a crew-performance measure or a safety assessment.</p>
              <button className="button-secondary" onClick={resetScenario} type="button"><RotateCcw size={14} /> Replay scenario</button>
            </div>
          )}
        </section>
      </div>
      <aside className="evidence-boundary"><Info size={16} /><p>Educational fiction only. Decisions, consequences, sensor states, and outcomes are project-authored; they do not represent NASA procedures, actual cabin measurements, validated suppression guidance, or certified spacecraft safety training.</p></aside>
    </div>
  )
}
