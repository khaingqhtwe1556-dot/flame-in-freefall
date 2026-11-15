import { useMemo, useState } from 'react'
import { ArrowUpRight, Globe, ShieldAlert } from 'lucide-react'
import { investigations } from '../data/investigations'
import { researchSources } from '../data/sources'

const missionTopics = {
  Moon: ['Habitat material flammability', 'Smoke and aerosol sensing', 'Fire growth and suppression', 'Crew response and system reliability'],
  Mars: ['Long-duration habitat monitoring', 'Smoke management', 'Equipment and life-support protection', 'Crew response and system reliability'],
}

export function MissionIntelligencePage() {
  const [mission, setMission] = useState<'Moon' | 'Mars'>('Moon')
  const candidates = useMemo(() => investigations.filter((item) => item.safetyRelationship === 'direct' || item.safetyRelationship === 'supporting'), [])
  const mappedSources = researchSources.filter((source) => ['S1', 'S2', 'S4', 'S5', 'S6', 'S7'].includes(source.id))

  return (
    <div className="page-content tool-page">
      <header className="tool-page-header">
        <div><span className="section-kicker">EVIDENCE TO EXPLORATION</span><h1>Moon & Mars intelligence</h1><p>Explore research themes that may inform future habitat-safety questions. These are not validated mission recommendations.</p></div>
        <span className="assistant-mode"><Globe size={16} /> RESEARCH LENS</span>
      </header>
      <div className="mission-switch" role="tablist" aria-label="Select mission">
        {(['Moon', 'Mars'] as const).map((body) => <button aria-selected={mission === body} className={mission === body ? 'mission-switch-active' : ''} key={body} onClick={() => setMission(body)} role="tab" type="button">{body} mission</button>)}
      </div>
      <section className="panel mission-intel-panel">
        <div className="panel-heading"><div><span className="section-kicker">{mission.toUpperCase()} HABITAT RESEARCH QUESTIONS</span><h2>Candidate areas for investigation</h2></div></div>
        <div className="topic-grid">{missionTopics[mission].map((topic, index) => <article className="topic-card" key={topic}><span>{String(index + 1).padStart(2, '0')}</span><h3>{topic}</h3><p>Research question for review; applicability depends on verified experimental conditions and mission design.</p></article>)}</div>
      </section>
      <section className="panel tool-panel">
        <div className="panel-heading"><div><span className="section-kicker">CURATED CANDIDATE RECORDS</span><h2>Potentially relevant catalog records</h2></div><span className="small-muted">{candidates.length} records · project-curated</span></div>
        <div className="mission-record-list">{candidates.map((item) => <article className="mission-record" key={item.accession}><div><span className="source-id">{item.accession} · {item.safetyRelationship}</span><h3>{item.acronym}</h3><p>{item.summary}</p><small>Mission relevance is a project categorization; conditions and transferability require source review.</small></div><a aria-label={`Open ${item.acronym} source`} href={item.sourceUrl} rel="noreferrer" target="_blank"><ArrowUpRight size={16} /></a></article>)}</div>
      </section>
      <section className="panel tool-panel"><div className="panel-heading"><div><span className="section-kicker">SUPPORTING CONTEXT</span><h2>NASA sources to review</h2></div></div><div className="source-chip-grid">{mappedSources.map((source) => <a className="source-chip" href={source.url} key={source.id} rel="noreferrer" target="_blank"><strong>{source.title}</strong><span>{source.relevance}</span><ArrowUpRight size={13} /></a>)}</div></section>
      <aside className="evidence-boundary"><ShieldAlert size={16} /><p>Earth-orbit, ground, lunar, and Martian conditions are not interchangeable. This view does not quantify risk or establish that any record predicts a habitat outcome.</p></aside>
    </div>
  )
}
