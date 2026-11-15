import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Activity,
  Bell,
  BrainCircuit,
  Camera,
  ChartColumnIncreasing,
  Database,
  Flame,
  GitCompareArrows,
  FlaskConical,
  Globe,
  Menu,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  FileText,
  X,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

const navigation = [
  { to: '/', label: 'Mission overview', icon: Activity, end: true },
  { to: '/explorer', label: 'NASA data explorer', icon: Database },
  { to: '/ranking', label: 'Experiment ranking', icon: SlidersHorizontal },
  { to: '/compare', label: 'Compare investigations', icon: GitCompareArrows },
  { to: '/assistant', label: 'SI research assistant', icon: BrainCircuit },
  { to: '/analytics', label: 'Fire risk analytics', icon: ChartColumnIncreasing },
  { to: '/lab', label: '3D flame lab', icon: Flame },
  { to: '/gravity', label: 'Earth vs microgravity', icon: GitCompareArrows },
  { to: '/emergency', label: 'Fire emergency simulator', icon: ShieldCheck },
  { to: '/habitat', label: 'Habitat explorer', icon: Globe },
  { to: '/image-analyzer', label: 'Flame image analyzer', icon: Camera },
  { to: '/concept-lab', label: 'Conceptual flame diagram', icon: FlaskConical },
  { to: '/missions', label: 'Moon & Mars insights', icon: Globe },
  { to: '/reports', label: 'Report generator', icon: FileText },
]

function pageTitle(pathname: string) {
  if (pathname.startsWith('/compare')) return 'Experiment Comparison'
  if (pathname.startsWith('/assistant')) return 'SI Research Assistant'
  if (pathname.startsWith('/analytics')) return 'Fire Risk Analytics'
  if (pathname.startsWith('/gravity')) return 'Earth vs Microgravity'
  if (pathname.startsWith('/emergency')) return 'Emergency Simulator'
  if (pathname.startsWith('/habitat')) return 'Habitat Explorer'
  if (pathname.startsWith('/image-analyzer')) return 'Flame Image Analyzer'
  if (pathname.startsWith('/concept-lab')) return 'Conceptual Flame Diagram'
  if (pathname.startsWith('/lab')) return '3D Flame Lab'
  if (pathname.startsWith('/missions')) return 'Moon & Mars Intelligence'
  if (pathname.startsWith('/reports')) return 'Report Generator'
  if (pathname.startsWith('/explorer')) return 'NASA Data Explorer'
  if (pathname.startsWith('/ranking')) return 'Experiment Intelligence'
  return 'Mission Overview'
}

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate(`/explorer?q=${encodeURIComponent(search.trim())}`)
    setSidebarOpen(false)
  }

  return (
    <div className="app-shell">
      <div aria-hidden="true" className="cosmic-backdrop">
        <div className="cosmic-galaxy" />
        <div className="cosmic-nebula cosmic-nebula-violet" />
        <div className="cosmic-nebula cosmic-nebula-cyan" />
        <div className="cosmic-nebula cosmic-nebula-rose" />
      </div>
      {sidebarOpen && (
        <button
          aria-label="Close navigation"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark">
            <Flame size={21} strokeWidth={2.2} />
          </div>
          <div>
            <div className="brand-name">FLAMEGUARD <span>SI</span></div>
            <div className="brand-caption">COMBUSTION INTELLIGENCE</div>
          </div>
          <button
            aria-label="Close navigation"
            className="icon-button sidebar-close"
            onClick={() => setSidebarOpen(false)}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>
        <nav aria-label="Main navigation" className="sidebar-nav">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
              end={end}
              key={to}
              onClick={() => setSidebarOpen(false)}
              to={to}
            >
              <Icon size={18} />
              <span>{label}</span>
              {to === '/ranking' && <span className="nav-indicator" />}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-status">
          <div className="status-orbit">
            <ShieldCheck size={18} />
          </div>
          <div>
            <strong>Evidence-first mode</strong>
            <span>Sources stay attached</span>
          </div>
          <span className="live-dot" aria-label="Active" />
        </div>

        <div className="sidebar-footer">
          <span className="nasa-wordmark">NASA</span>
          <span>SPACE APPS · 2026</span>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-leading">
            <button
              aria-label="Open navigation"
              className="icon-button menu-button"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <span>FLAMEGUARD SI</span>
              <span className="breadcrumb-divider">/</span>
              <strong>{pageTitle(location.pathname)}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <form className="global-search" onSubmit={submitSearch} role="search">
              <Search size={16} aria-hidden="true" />
              <input
                aria-label="Search NASA investigation records"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search investigations..."
                value={search}
              />
            </form>
            <span aria-label="Notifications: no new alerts" className="icon-button notification-button" role="img">
              <Bell size={18} />
              <span className="notification-dot" />
            </span>
            <div aria-label="Research team workspace" className="profile-button" role="group">
              <span className="profile-avatar">FG</span>
              <span className="profile-name">Research team</span>
            </div>
          </div>
        </header>
        <div className="page-scroll">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="route-transition"
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              key={location.pathname}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
