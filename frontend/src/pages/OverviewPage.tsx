import { lazy, Suspense, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Atom,
  BookOpen,
  Camera,
  CirclePlay,
  Database,
  FileText,
  Flame,
  GitCompareArrows,
  Globe,
  Rocket,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { investigations } from '../data/investigations'
import { historicalIncidents, researchSources, type ResearchSource } from '../data/sources'
import { calculateRanking, rankingPresets } from '../data/ranking'
import { StatCard } from '../components/ResearchComponents'
import { MissionBriefingModal } from '../components/MissionBriefingModal'

const ResearchThemeChart = lazy(() =>
  import('../components/ResearchThemeChart').then((module) => ({ default: module.ResearchThemeChart })),
)
const defaultWeights = rankingPresets['Spacecraft fire safety']
const sourceIcons: Record<ResearchSource['kind'], LucideIcon> = {
  Repository: Database,
  'Science overview': Atom,
  Video: CirclePlay,
  'Technical guide': BookOpen,
  'Incident history': ShieldAlert,
  'Technology transfer': FileText,
}

const rankedPreview = calculateRanking(investigations, defaultWeights).slice(0, 4)
const interactiveExperiences = [
  { to: '/lab', title: '3D flame lab', subtitle: 'Tune fuel, oxygen & flow', icon: Flame, visual: 'experience-flame' },
  { to: '/gravity', title: 'Earth vs microgravity', subtitle: 'Compare flame concepts', icon: GitCompareArrows, visual: 'experience-orbit' },
  { to: '/emergency', title: 'Fire emergency simulator', subtitle: 'Explore a fictional scenario', icon: ShieldAlert, visual: 'experience-alert' },
  { to: '/habitat', title: 'Habitat explorer', subtitle: 'Inspect conceptual habitats', icon: Globe, visual: 'experience-habitat' },
  { to: '/image-analyzer', title: 'Flame image analyzer', subtitle: 'Inspect uploaded images', icon: Camera, visual: 'experience-image' },
]

export function OverviewPage() {
  const reduceMotion = useReducedMotion()
  const [briefingOpen, setBriefingOpen] = useState(false)

  return (
    <div className="page-content overview-page">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="hero-panel"
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: reduceMotion ? 0 : 0.35 }}
      >
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> NASA SPACE APPS · COMBUSTION INTELLIGENCE</div>
          <h1>FLAMEGUARD SI<br /><span>Mission control</span></h1>
          <p>Turning Microgravity Combustion Research into Space Safety Intelligence.</p>
          <div className="hero-actions">
            <button className="button-primary" onClick={() => setBriefingOpen(true)} type="button">
              <Rocket size={15} /> Start mission briefing
            </button>
            <Link className="button-secondary" to="/explorer">
              Explore NASA research
            </Link>
          </div>
          <div className="hero-note">
            <ShieldAlert size={15} />
            Evidence-led catalog · no verified downloadable files
          </div>
        </div>
        <div aria-hidden="true" className="hero-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="orbit-center"><Flame size={42} /></div>
          <div className="orbit-node node-one"><Atom size={15} /></div>
          <div className="orbit-node node-two"><span /></div>
          <div className="orbit-node node-three"><span /></div>
          <div className="visual-caption">COMBUSTION / MICROGRAVITY</div>
        </div>
        <div className="hero-grid-glow" />
      </motion.section>

      <section aria-label="Research catalog metrics" className="stats-grid">
        <StatCard
          icon={Database}
          label="Investigations indexed"
          note="Curated PSI metadata"
          tone="blue"
          value={investigations.length.toString()}
        />
        <StatCard
          icon={FileText}
          label="Verified dataset files"
          note="No downloads verified"
          tone="cyan"
          value="0"
        />
        <StatCard
          icon={Sparkles}
          label="Research sources"
          note={`${historicalIncidents.length} historical incidents included`}
          tone="green"
          value={researchSources.length.toString()}
        />
        <StatCard
          icon={Atom}
          label="AI insights generated"
          note="Not tracked in this prototype"
          tone="orange"
          value="Not tracked"
        />
      </section>

      <section aria-labelledby="experiences-heading" className="experience-section">
        <div className="experience-section-heading">
          <div><span className="section-kicker">INTERACTIVE MISSION SYSTEMS</span><h2 id="experiences-heading">Choose your experience</h2></div>
          <span className="experience-status"><i /> SIMULATIONS ARE ILLUSTRATIVE</span>
        </div>
        <div className="experience-grid">
          {interactiveExperiences.map(({ to, title, subtitle, icon: Icon, visual }, index) => (
            <motion.article className="experience-card" key={to} whileHover={reduceMotion ? undefined : { y: -4 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
              <Link aria-label={`${title}: ${subtitle}`} className="experience-card-link" to={to}>
                <div className={`experience-visual ${visual}`} aria-hidden="true">
                  <span className="experience-visual-orbit" />
                  <Icon size={28} strokeWidth={1.6} />
                  <span className="experience-index">0{index + 1}</span>
                </div>
                <div className="experience-card-copy">
                  <span>{subtitle}</span>
                  <strong>{title}</strong>
                </div>
                <ArrowUpRight aria-hidden="true" className="experience-arrow" size={16} />
              </Link>
            </motion.article>
          ))}
        </div>
      </section>

      <div className="overview-grid">
        <section className="panel research-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">CATALOG SNAPSHOT</span>
              <h2>Research by theme</h2>
            </div>
            <Link className="text-link" to="/explorer">View explorer <ArrowRight size={14} /></Link>
          </div>
          <p className="panel-description">
            Count of indexed PSI records by their reviewed research theme. This is
            a catalog grouping, not a measure of dataset readiness.
          </p>
          <div className="chart-wrap">
            <Suspense fallback={<div className="chart-fallback" role="status">Loading catalog visualization...</div>}>
              <ResearchThemeChart />
            </Suspense>
          </div>
        </section>

        <section className="panel ranking-preview-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">EXPLAINABLE PRIORITIZATION</span>
              <h2>Safety research signals</h2>
            </div>
            <Link aria-label="Open ranking workspace" className="icon-link" to="/ranking"><ArrowRight size={17} /></Link>
          </div>
          <div className="ranking-preview-list">
            {rankedPreview.map((item, index) => (
              <div className="preview-row" key={item.investigation.accession}>
                <span className="preview-rank">{String(index + 1).padStart(2, '0')}</span>
                <div className="preview-main">
                  <strong>{item.investigation.acronym}</strong>
                  <span>{item.investigation.accession} · {item.supportedCriteria}/5 criteria supported</span>
                  <div className="mini-track"><span style={{ width: `${item.score ?? 0}%` }} /></div>
                </div>
                <strong className="preview-score">{item.score === null ? 'N/A' : Math.round(item.score)}</strong>
              </div>
            ))}
          </div>
          <div className="ranking-caveat">
            <ShieldAlert size={15} />
            Prototype rubric - not NASA-validated. Unknown dataset and ML evidence stays unscored.
          </div>
          <Link className="button-subtle" to="/ranking">
            Configure ranking <ArrowRight size={14} />
          </Link>
        </section>
      </div>

      <div className="overview-grid lower-grid">
        <section className="panel mission-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">FROM EVIDENCE TO EXPLORATION</span>
              <h2>Mission safety, with context</h2>
            </div>
            <Atom className="heading-accent" size={19} />
          </div>
          <p className="panel-description">
            NASA's ground and reduced-gravity studies can inform research questions
            for future habitats. They do not certify a design or directly predict
            fire behavior in lunar or Martian conditions.
          </p>
          <div className="mission-cards">
            <article className="mission-card moon-card">
              <span className="mission-glyph">01</span>
              <div><strong>Lunar habitats</strong><span>Material flammability · reduced-g context · crew response</span></div>
              <span className="mission-status">RESEARCH LENS</span>
            </article>
            <article className="mission-card mars-card">
              <span className="mission-glyph">02</span>
              <div><strong>Mars habitats</strong><span>Detection · smoke management · system reliability</span></div>
              <span className="mission-status">RESEARCH LENS</span>
            </article>
          </div>
        </section>

        <section className="panel sources-panel">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">SOURCE TRACEABILITY</span>
              <h2>Start with NASA</h2>
            </div>
            <span className="source-count">{researchSources.length} SOURCES</span>
          </div>
          <div className="source-list">
            {researchSources.slice(0, 4).map((source) => {
              const SourceIcon = sourceIcons[source.kind]
              return (
                <a className="source-row" href={source.url} key={source.id} rel="noreferrer" target="_blank">
                  <span className="source-icon"><SourceIcon size={15} /></span>
                  <span><strong>{source.title}</strong><small>{source.kind} · {source.relevance}</small></span>
                  <ArrowUpRight size={13} />
                </a>
              )
            })}
          </div>
          <Link className="text-link source-library-link" to="/explorer">
            Browse indexed investigation metadata <ArrowRight size={14} />
          </Link>
        </section>
      </div>

      <footer className="page-footer">
        <span>FLAMEGUARD SI <span className="footer-dot">·</span> NASA SPACE APPS 2026</span>
        <span>Source-grounded research interface <span className="footer-dot">·</span> No flight-certified recommendations</span>
      </footer>
      {briefingOpen && <MissionBriefingModal onClose={() => setBriefingOpen(false)} />}
    </div>
  )
}
