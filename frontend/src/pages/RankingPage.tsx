import { useMemo, useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Info, SlidersHorizontal, Sparkles } from 'lucide-react'
import { investigations } from '../data/investigations'
import { adjustWeights, calculateRanking, rankingCriteria, rankingPresets } from '../data/ranking'
import type { RankingWeights } from '../types/research'

const modes = Object.keys(rankingPresets) as (keyof typeof rankingPresets)[]
type Mode = keyof typeof rankingPresets | 'Custom'

const modeDescriptions: Record<string, string> = {
  'Spacecraft fire safety': 'Balance direct safety relevance, reduced-gravity context, evidence readiness, and mission transfer potential.',
  'Machine learning': 'Emphasize data access and ML readiness. Those criteria remain unknown until raw files and labels are reviewed.',
  'Early fire detection': 'Focus the result set on smoke and aerosol measurement investigations; this is a project-defined lens.',
  'Smoke research': 'Prioritize smoke, aerosol, and related modeling records with traceable PSI metadata.',
  'Moon missions': 'Use candidate relevance to lunar habitat questions; this is not a lunar-system validation.',
  'Mars missions': 'Use candidate relevance to long-duration habitat questions; this is not a Mars-system validation.',
  Custom: 'Adjust criteria weights; the interface preserves a 100% total.',
}

function isRelevantToMode(accession: string, mode: Mode) {
  const record = investigations.find((item) => item.accession === accession)
  if (!record) return false
  if (mode === 'Early fire detection') {
    return record.category === 'smoke-detection'
  }
  if (mode === 'Smoke research') {
    return record.category === 'smoke-detection' || accession === 'PSI-115'
  }
  return true
}

export function RankingPage() {
  const [mode, setMode] = useState<Mode>('Spacecraft fire safety')
  const [weights, setWeights] = useState<RankingWeights>(rankingPresets['Spacecraft fire safety'])
  const [expandedAccession, setExpandedAccession] = useState<string | null>(null)

  const ranked = useMemo(() => {
    const subset = investigations.filter((item) => isRelevantToMode(item.accession, mode))
    return calculateRanking(subset, weights)
  }, [mode, weights])

  const weightTotal = rankingCriteria.reduce((total, { key }) => total + weights[key], 0)
  const evidenceCoverage = ranked.length
    ? Math.round(ranked.reduce((total, item) => total + item.evidenceCoverage, 0) / ranked.length)
    : 0

  function chooseMode(nextMode: string) {
    if (nextMode in rankingPresets) {
      setMode(nextMode as Mode)
      setWeights(rankingPresets[nextMode])
      setExpandedAccession(null)
    }
  }

  function updateWeight(criterion: keyof RankingWeights, value: number) {
    setWeights((current) => adjustWeights(current, criterion, value))
    setMode('Custom')
  }

  return (
    <div className="page-content ranking-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> PROJECT-DEFINED · EVIDENCE-BASED PRIORITIZATION</div>
          <h1>Experiment Intelligence</h1>
          <p>Make the ranking logic visible. Change the emphasis, inspect the evidence, and see what is still unknown.</p>
        </div>
        <div className="ranking-total-badge">
          <SlidersHorizontal size={17} />
          <span>{Math.round(weightTotal)}% total weight</span>
        </div>
      </div>

      <div className="ranking-warning">
        <AlertTriangle size={18} />
        <div>
          <strong>Prototype ranking - not NASA-validated.</strong>
          <span>Scores are a transparent team rubric over reviewed metadata. They are not probabilities, hazard ratings, or mission recommendations.</span>
        </div>
      </div>

      <div className="ranking-layout">
        <section className="panel ranking-controls">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">RANKING PROFILE</span>
              <h2>Choose what matters</h2>
            </div>
            <span className="control-icon"><Sparkles size={17} /></span>
          </div>
          <label className="mode-select-label">
            <span>Analysis mode</span>
            <span className="select-shell">
              <select onChange={(event) => chooseMode(event.target.value)} value={mode}>
                {modes.map((item) => <option key={item} value={item}>{item}</option>)}
                <option disabled value="Custom">Custom weights</option>
              </select>
              <ChevronDown size={15} />
            </span>
          </label>
          <p className="mode-description">{modeDescriptions[mode]}</p>

          <div className="weight-section-heading">
            <strong>Criterion weights</strong>
            <span>Must total 100%</span>
          </div>
          <div className="weight-list">
            {rankingCriteria.map(({ key, label }) => (
              <label className="weight-control" key={key}>
                <span className="weight-label-row">
                  <span>{label}</span>
                  <strong>{weights[key].toFixed(weights[key] % 1 ? 1 : 0)}%</strong>
                </span>
                <input
                  aria-label={`${label} weight`}
                  max="100"
                  min="0"
                  onChange={(event) => updateWeight(key, Number(event.target.value))}
                  type="range"
                  value={weights[key]}
                />
              </label>
            ))}
          </div>
          <div className="weight-total-line">
            <span>Total weight</span>
            <strong className={Math.abs(weightTotal - 100) < 0.001 ? 'weight-valid' : 'weight-invalid'}>
              {weightTotal.toFixed(weightTotal % 1 ? 1 : 0)}%
            </strong>
          </div>
          <div className="ranking-method-note">
            <Info size={15} />
            <p>Scores use only supported criteria; the remaining weights are renormalized for that record. Evidence coverage shows the portion of the selected weight that had support.</p>
          </div>
        </section>

        <section className="ranking-results">
          <div className="panel ranking-summary">
            <div className="ranking-summary-heading">
              <div>
                <span className="section-kicker">RANKED INVESTIGATIONS</span>
                <h2>{mode}</h2>
              </div>
              <span className="result-count">{ranked.length} RECORDS</span>
            </div>
            <p>{modeDescriptions[mode]}</p>
            <div className="coverage-summary">
              <div className="coverage-copy">
                <span>Average evidence coverage</span>
                <strong>{evidenceCoverage}%</strong>
              </div>
              <div className="coverage-track"><span style={{ width: `${evidenceCoverage}%` }} /></div>
              <small>Dataset availability and ML suitability remain unknown until file-level validation.</small>
            </div>
          </div>

          <div className="ranked-list">
            {ranked.map((item, index) => {
              const isExpanded = expandedAccession === item.investigation.accession
              return (
                <article className={`ranked-card ${isExpanded ? 'ranked-card-expanded' : ''}`} key={item.investigation.accession}>
                  <button
                    aria-expanded={isExpanded}
                    className="ranked-card-main"
                    onClick={() => setExpandedAccession(isExpanded ? null : item.investigation.accession)}
                    type="button"
                  >
                    <span className="rank-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="ranked-record">
                      <strong>{item.investigation.acronym}</strong>
                      <small>{item.investigation.accession} · {item.investigation.title}</small>
                    </span>
                    <span className="ranked-progress">
                      <span className="ranked-score-line"><strong>{item.score === null ? 'N/A' : Math.round(item.score)}</strong><small>{item.score === null ? '' : '/ 100'}</small></span>
                      <span className="mini-track"><span style={{ width: `${item.score ?? 0}%` }} /></span>
                    </span>
                    <span className="ranked-coverage">
                      <strong>{item.evidenceCoverage}%</strong>
                      <small>evidence</small>
                    </span>
                    <span className="expand-icon">{isExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</span>
                  </button>
                  {isExpanded && (
                    <div className="evidence-breakdown">
                      {rankingCriteria.map(({ key, label }) => {
                        const evidence = item.criterionEvidence[key]
                        return (
                          <div className="evidence-row" key={key}>
                            <span className="evidence-criterion">{label}</span>
                            <span className={evidence.score === null ? 'evidence-unknown' : 'evidence-score'}>
                              {evidence.score === null ? 'UNKNOWN' : `${evidence.score} / 5`}
                            </span>
                            <p>{evidence.explanation}</p>
                          </div>
                        )
                      })}
                      <div className="evidence-source">
                        <span>Evidence class: PSI metadata review</span>
                        <span>Score reflects the project rubric, not NASA endorsement.</span>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      </div>
      <footer className="page-footer">
        <span>Scoring method: weighted mean of known 0-5 rubric values, scaled to 0-100</span>
        <span>Unknown is not zero <span className="footer-dot">·</span> Coverage shown per record</span>
      </footer>
    </div>
  )
}
