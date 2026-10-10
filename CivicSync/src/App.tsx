
import { useMemo, useState } from 'react'
import './App.css'
import ProjectMap from './ProjectMap'

type Project = {
  id: number
  name: string
  department: string
  road: string
  start: string
  end: string
  status: 'In Progress' | 'Planned' | 'Completed'
  category: string
}

const initialProjects: Project[] = [
  {
    id: 1,
    name: 'Water Pipeline Replacement',
    department: 'Water Supply',
    road: 'Main Road',
    start: '2026-10-12',
    end: '2026-10-18',
    status: 'In Progress',
    category: 'Water',
  },
  {
    id: 2,
    name: 'Drainage System Upgrade',
    department: 'Public Works',
    road: 'Main Road',
    start: '2026-10-15',
    end: '2026-10-21',
    status: 'Planned',
    category: 'Drainage',
  },
  {
    id: 3,
    name: 'Road Resurfacing',
    department: 'Public Works',
    road: 'MG Road',
    start: '2026-10-18',
    end: '2026-10-27',
    status: 'Planned',
    category: 'Road',
  },
  {
    id: 4,
    name: 'Streetlight Modernisation',
    department: 'Electricity',
    road: 'Gandhi Street',
    start: '2026-10-22',
    end: '2026-10-28',
    status: 'In Progress',
    category: 'Telecom',
  },
  {
    id: 5,
    name: 'Water Connection Upgrade',
    department: 'Water Supply',
    road: 'MG Road',
    start: '2026-10-20',
    end: '2026-10-26',
    status: 'Planned',
    category: 'Water',
  },
  {
    id: 6,
    name: 'Lake Road Repairs',
    department: 'Public Works',
    road: 'Lake View Road',
    start: '2026-11-02',
    end: '2026-11-10',
    status: 'Planned',
    category: 'Road',
  },
]

const navItems = [
  ['▦', 'Dashboard'],
  ['⌖', 'Public Works Map'],
  ['⚠', 'Conflicts'],
  ['▤', 'Projects'],
  ['▦', 'Schedule Simulator'],
  ['♧', 'Citizen Reports'],
  ['◷', 'Audit Trail'],
  ['⚙', 'Settings'],
]

function overlaps(a: Project, b: Project) {
  return a.start <= b.end && b.start <= a.end
}

function getConflicts(items: Project[]) {
  const results: { first: Project; second: Project }[] = []

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const first = items[i]
      const second = items[j]

      if (
        first.road.trim().toLowerCase() ===
          second.road.trim().toLowerCase() &&
        overlaps(first, second)
      ) {
        results.push({ first, second })
      }
    }
  }

  return results
}

function shortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  })
}

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [projects, setProjects] = useState(initialProjects)
  const [simulationRun, setSimulationRun] = useState(false)
  const [notice, setNotice] = useState('')

  const conflicts = useMemo(() => getConflicts(projects), [projects])

  const filteredProjects = projects.filter((project) => {
    const query = search.trim().toLowerCase()
    const matchesText = `${project.name} ${project.road} ${project.department}`
      .toLowerCase()
      .includes(query)

    const matchesCategory =
      category === 'All' || project.category === category

    return matchesText && matchesCategory
  })

  function runSimulation() {
    const drainage = projects.find(
      (project) => project.id === 2,
    )

    if (!drainage) return

    setProjects((current) =>
      current.map((project) =>
        project.id === 2
          ? {
              ...project,
              start: '2026-10-22',
              end: '2026-10-28',
            }
          : project,
      ),
    )

    setSimulationRun(true)
    setNotice(
      'Demo schedule updated. Verify the dates and operational constraints before adopting any proposal.',
    )
  }

  function resetSimulation() {
    setProjects(initialProjects)
    setSimulationRun(false)
    setNotice('')
  }

  return (
    <div className="civic-app">
      <header className="topbar">
        <a
          className="brand"
          href="#dashboard"
          onClick={() => setActiveNav('Dashboard')}
        >
          <span className="brand-mark">⌂</span>
          <span>
            Civic<span>Sync</span>
          </span>
        </a>

        <span className="topbar-tag">PUBLIC WORKS INTELLIGENCE</span>

        <div className="user-chip">
          <span className="user-avatar">AD</span>
          <span>
            <b>Demo Admin</b>
            <small>City Operations</small>
          </span>
        </div>
      </header>

      <section className="hero" id="dashboard">
        <div className="hero-copy">
          <span className="hero-kicker">
            SMART CITIES · BETTER COORDINATION
          </span>
          <h1>
            Smart Coordination.
            <br />
            <span>Fewer Diggings.</span>
          </h1>
          <p>
            An intelligent platform to identify infrastructure conflicts,
            coordinate public works, and bring transparency to citizens
            before the work begins.
          </p>
          <div className="hero-pills">
            <span>✓ Conflict detection</span>
            <span>✓ Schedule planning</span>
            <span>✓ Citizen transparency</span>
          </div>
        </div>

        <div
          className="hero-art"
          aria-label="Illustration of a city skyline and road"
        >
          <div className="skyline">
            <span>▥</span>
            <span>▦</span>
            <span>▤</span>
            <span>▥</span>
            <span>▦</span>
            <span>▤</span>
            <span>▥</span>
          </div>
          <div className="sun" />
          <div className="road">
            <div className="road-line" />
          </div>
          <div className="hero-quote">
            Better planning today,
            <br />
            smoother cities tomorrow.
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <Feature
          icon="⌘"
          title="Conflict Intelligence"
          text="Detects location and schedule overlaps across departments."
          tone="blue"
        />
        <Feature
          icon="▦"
          title="Schedule Simulator"
          text="Compare timelines and suggest coordinated work windows."
          tone="green"
        />
        <Feature
          icon="⌖"
          title="Disruption Insights"
          text="Highlight projects that may affect daily travel."
          tone="orange"
        />
        <Feature
          icon="⬡"
          title="Readiness Check"
          text="Review dependencies and coordination steps."
          tone="purple"
        />
        <Feature
          icon="♧"
          title="Citizen Transparency"
          text="Make project status visible to residents."
          tone="cyan"
        />
      </section>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-mark">⌂</span>
            CivicSync
          </div>

          <div className="side-label">WORKSPACE</div>

          {navItems.map(([icon, label]) => (
            <button
              key={label}
              className={`nav-item ${
                activeNav === label ? 'selected' : ''
              }`}
              onClick={() => setActiveNav(label)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}

          <div className="sidebar-bottom">
            <div className="mini-city">▥ ▦ ▥</div>
            <b>
              Smart Cities
              <br />
              Better Lives
            </b>
            <small>Prototype dashboard</small>
          </div>
        </aside>

        <main className="dashboard">
          <div className="dashboard-heading">
            <div>
              <p className="overline">CITY OPERATIONS / OVERVIEW</p>
              <h2>
                {activeNav === 'Dashboard'
                  ? 'Good morning, Admin'
                  : activeNav}
              </h2>
              <p className="muted">
                Here’s what’s happening with your city’s infrastructure today.
              </p>
            </div>

            <div className="location-pill">
              ⌖ &nbsp; Demo City <span>⌄</span>
            </div>
          </div>

          {notice && (
            <div className="notice-banner">
              <span>{notice}</span>
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice('')}
              >
                ×
              </button>
            </div>
          )}

          <section className="metric-grid">
            <Metric
              icon="▰"
              value={String(projects.length).padStart(2, '0')}
              label="Total Projects"
              note="Across departments"
              tone="blue"
            />
            <Metric
              icon="!"
              value={String(conflicts.length).padStart(2, '0')}
              label="Conflicts Detected"
              note="Requires coordination"
              tone="red"
            />
            <Metric
              icon="⟳"
              value={String(conflicts.length).padStart(2, '0')}
              label="Repeat-Dig Risks"
              note="Potential overlaps"
              tone="amber"
            />
            <Metric
              icon="♧"
              value="12"
              label="Citizen Reports"
              note="Demo summary"
              tone="green"
            />
          </section>

          <section className="main-grid">
            <div className="panel map-panel">
              <div className="panel-heading">
                <div>
                  <h3>Public Works Map</h3>
                  <p>Interactive map · Fictional demo locations</p>
                </div>
                <span className="live-dot">● MAP</span>
              </div>

              <div className="map-toolbar">
                <input
                  aria-label="Search projects"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search road or project..."
                />

                <select
                  aria-label="Filter project category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="All">All</option>
                  <option value="Water">Water</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Telecom">Telecom</option>
                  <option value="Road">Road</option>
                </select>
              </div>

              <p className="map-demo-note">
                Sample coordinates only. These are not verified public works
                locations.
              </p>

              <ProjectMap
                projects={filteredProjects}
                onSelect={(project) =>
                  setNotice(
                    `${project.name} — ${project.road}. Sample dates: ${project.start} to ${project.end}.`,
                  )
                }
              />
            </div>

            <div className="panel conflicts-panel">
              <div className="panel-heading">
                <div>
                  <h3>Top Conflicts</h3>
                  <p>Potential scheduling overlaps</p>
                </div>
                <span className="count-badge">{conflicts.length}</span>
              </div>

              {conflicts.length > 0 ? (
                conflicts.slice(0, 5).map(({ first, second }) => (
                  <div
                    className="conflict-row"
                    key={`${first.id}-${second.id}`}
                  >
                    <span className="conflict-symbol">!</span>
                    <div className="conflict-text">
                      <b>{first.road}</b>
                      <p>
                        {first.name} + {second.name}
                      </p>
                      <small>
                        {shortDate(first.start)} – {shortDate(first.end)}
                        {' / '}
                        {shortDate(second.start)} – {shortDate(second.end)}
                      </small>
                    </div>
                    <span className="severity">Review</span>
                  </div>
                ))
              ) : (
                <div className="empty-small">
                  No overlaps detected with the current sample schedule.
                </div>
              )}

              <p className="panel-footnote">
                A flagged overlap needs human review; it does not prove
                duplicate excavation.
              </p>
            </div>

            <div className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <h3>Recent Activities</h3>
                  <p>Illustrative activity feed</p>
                </div>
                <span className="activity-count">5</span>
              </div>

              <Activity
                icon="✓"
                title="Conflict review created"
                detail="Main Road · Water + Drainage"
                time="2 hours ago"
                tone="green"
              />
              <Activity
                icon="♧"
                title="Citizen report received"
                detail="Road damage report · Demo"
                time="4 hours ago"
                tone="blue"
              />
              <Activity
                icon="▤"
                title="Project schedule updated"
                detail="Road resurfacing · Demo"
                time="6 hours ago"
                tone="purple"
              />
              <Activity
                icon="◷"
                title="Schedule proposal created"
                detail="Main Road · Coordination"
                time="8 hours ago"
                tone="cyan"
              />
              <Activity
                icon="✓"
                title="Review note recorded"
                detail="Drainage work · Demo"
                time="10 hours ago"
                tone="green"
              />
            </div>

            <div className="panel details-panel">
              <div className="panel-heading">
                <div>
                  <h3>Conflict Details</h3>
                  <p>Example flagged road segment</p>
                </div>
                <span className="priority">Needs review</span>
              </div>

              <div className="detail-road">⌖ &nbsp; Main Road</div>

              <div className="detail-item">
                <span className="detail-dot water-dot" />
                <div>
                  <b>Water Pipeline Replacement</b>
                  <p>
                    {shortDate('2026-10-12')} – {shortDate('2026-10-18')}
                  </p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-dot drain-dot" />
                <div>
                  <b>Drainage System Upgrade</b>
                  <p>
                    {shortDate(
                      simulationRun ? '2026-10-22' : '2026-10-15',
                    )}{' '}
                    –{' '}
                    {shortDate(
                      simulationRun ? '2026-10-28' : '2026-10-21',
                    )}
                  </p>
                </div>
              </div>

              <div className="review-callout">
                ⚠ Verify exact work locations, permits, and on-site schedules
                before confirming a conflict.
              </div>
            </div>

            <div className="panel timeline-panel">
              <div className="panel-heading">
                <div>
                  <h3>Timeline Comparison</h3>
                  <p>Planned work windows</p>
                </div>
                <span className="timeline-key">
                  <i /> Original <i /> Proposed
                </span>
              </div>

              <Timeline label="Water" start={1} width={34} tone="blue" />
              <Timeline
                label="Drainage"
                start={24}
                width={38}
                tone="green"
              />

              <div className="timeline-divider">
                <span>
                  {simulationRun ? 'PROPOSED WINDOW' : 'OVERLAPPING PERIOD'}
                </span>
              </div>

              <Timeline label="Water" start={1} width={34} tone="blue" />
              <Timeline
                label="Drainage"
                start={simulationRun ? 45 : 24}
                width={38}
                tone="green"
              />

              <div
                className={`timeline-result ${
                  simulationRun ? 'success' : ''
                }`}
              >
                {simulationRun
                  ? '✓ Demo dates adjusted — verify feasibility'
                  : '⚠ Overlap detected — consider a coordinated schedule'}
              </div>
            </div>

            <div className="panel simulator-panel">
              <div className="panel-heading">
                <div>
                  <h3>Schedule Simulator</h3>
                  <p>Test a proposed work window</p>
                </div>
                <span className="sim-icon">⟳</span>
              </div>

              <div className="sim-project">
                <span className="sim-dot water-dot" />
                <div>
                  <b>Water Pipeline</b>
                  <small>Main Road</small>
                </div>
                <span>
                  {shortDate('2026-10-12')} – {shortDate('2026-10-18')}
                </span>
              </div>

              <div className="sim-project">
                <span className="sim-dot drain-dot" />
                <div>
                  <b>Drainage Upgrade</b>
                  <small>Main Road</small>
                </div>
                <span>
                  {shortDate(
                    simulationRun ? '2026-10-22' : '2026-10-15',
                  )}{' '}
                  –{' '}
                  {shortDate(
                    simulationRun ? '2026-10-28' : '2026-10-21',
                  )}
                </span>
              </div>

              <button
                className="primary-button"
                onClick={simulationRun ? resetSimulation : runSimulation}
              >
                {simulationRun
                  ? '↺ Reset Demo Schedule'
                  : '⟳ Run Schedule Simulation'}
              </button>

              <div
                className={`simulation-result ${
                  simulationRun ? 'success' : ''
                }`}
              >
                <b>
                  {simulationRun
                    ? 'Demo schedule adjusted'
                    : 'Simulation ready'}
                </b>
                <p>
                  {simulationRun
                    ? 'The sample dates were moved to remove the detected overlap. Verify operational constraints before adopting any schedule.'
                    : 'Run the demo to move drainage work after the water project.'}
                </p>
              </div>
            </div>
          </section>

          <section className="bottom-grid">
            <div className="bottom-card impact-card">
              <span className="bottom-icon">⌂</span>
              <div>
                <h3>Real-World Impact</h3>
                <p>Less repeat excavation</p>
                <p>Better coordination</p>
                <p>More transparent projects</p>
              </div>
            </div>

            <div className="bottom-card">
              <h3>Technology Stack</h3>
              <div className="tech-list">
                <span>⚛ React + Vite</span>
                <span>TS TypeScript</span>
                <span>▤ Conflict logic</span>
                <span>⌖ OpenStreetMap</span>
              </div>
              <p className="muted">
                Current prototype uses local demo data.
              </p>
            </div>

            <div className="bottom-card">
              <h3>Project Workflow</h3>
              <div className="workflow">
                <span>Collect<br />projects</span>
                <b>→</b>
                <span>Detect<br />conflicts</span>
                <b>→</b>
                <span>Propose<br />schedule</span>
                <b>→</b>
                <span>Review<br />&amp; report</span>
              </div>
              <div className="workflow-banner">
                CivicSync — Coordinated today. A better tomorrow.
              </div>
            </div>
          </section>

          <footer className="dashboard-footer">
            <span>CivicSync · CivicTech Prototype</span>
            <span>
              Demo data only · Potential conflicts require verification
            </span>
          </footer>
        </main>
      </div>
    </div>
  )
}

function Feature({
  icon,
  title,
  text,
  tone,
}: {
  icon: string
  title: string
  text: string
  tone: string
}) {
  return (
    <article className="feature-card">
      <span className={`feature-icon ${tone}`}>{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  )
}

function Metric({
  icon,
  value,
  label,
  note,
  tone,
}: {
  icon: string
  value: string
  label: string
  note: string
  tone: string
}) {
  return (
    <article className="metric-card">
      <span className={`metric-icon ${tone}`}>{icon}</span>
      <div>
        <strong>{value}</strong>
        <b>{label}</b>
        <small>{note}</small>
      </div>
    </article>
  )
}

function Activity({
  icon,
  title,
  detail,
  time,
  tone,
}: {
  icon: string
  title: string
  detail: string
  time: string
  tone: string
}) {
  return (
    <div className="activity-row">
      <span className={`activity-icon ${tone}`}>{icon}</span>
      <div>
        <b>{title}</b>
        <p>{detail}</p>
        <small>{time}</small>
      </div>
    </div>
  )
}

function Timeline({
  label,
  start,
  width,
  tone,
}: {
  label: string
  start: number
  width: number
  tone: string
}) {
  return (
    <div className="timeline-row">
      <span className="timeline-label">{label}</span>
      <div className="timeline-track">
        <div
          className={`timeline-bar ${tone}`}
          style={{ left: `${start}%`, width: `${width}%` }}
        />
      </div>
    </div>
  )
}

export default App
