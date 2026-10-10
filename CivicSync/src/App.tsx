
import { useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'
import ProjectMap from './ProjectMap'
import CitizenReports from './CitizenReports'
import ProjectManagement from './ProjectManagement'

type ProjectStatus = 'Planned' | 'In Progress' | 'Completed'
type ProjectCategory = 'Water' | 'Drainage' | 'Road' | 'Telecom'

type Project = {
  id: string
  name: string
  department: string
  road: string
  startDate: string
  endDate: string
  status: ProjectStatus
  category: ProjectCategory
  budget: number
  description: string
}

const initialProjects: Project[] = [
  {
    id: 'demo-1',
    name: 'Water Pipeline Replacement',
    department: 'Water Supply',
    road: 'Main Road',
    startDate: '2026-10-12',
    endDate: '2026-10-18',
    status: 'In Progress',
    category: 'Water',
    budget: 850000,
    description: 'Replacement of an ageing water pipeline.',
  },
  {
    id: 'demo-2',
    name: 'Drainage System Upgrade',
    department: 'Public Works',
    road: 'Main Road',
    startDate: '2026-10-15',
    endDate: '2026-10-21',
    status: 'Planned',
    category: 'Drainage',
    budget: 620000,
    description: 'Drainage improvement and maintenance work.',
  },
  {
    id: 'demo-3',
    name: 'Road Resurfacing',
    department: 'Public Works',
    road: 'MG Road',
    startDate: '2026-10-18',
    endDate: '2026-10-27',
    status: 'Planned',
    category: 'Road',
    budget: 1200000,
    description: 'Resurfacing damaged sections of the road.',
  },
  {
    id: 'demo-4',
    name: 'Streetlight Modernisation',
    department: 'Electricity',
    road: 'Gandhi Street',
    startDate: '2026-10-22',
    endDate: '2026-10-28',
    status: 'In Progress',
    category: 'Telecom',
    budget: 450000,
    description: 'Upgrading street lighting infrastructure.',
  },
  {
    id: 'demo-5',
    name: 'Water Connection Upgrade',
    department: 'Water Supply',
    road: 'MG Road',
    startDate: '2026-10-20',
    endDate: '2026-10-26',
    status: 'Planned',
    category: 'Water',
    budget: 380000,
    description: 'Upgrading existing water connections.',
  },
  {
    id: 'demo-6',
    name: 'Lake Road Repairs',
    department: 'Public Works',
    road: 'Lake View Road',
    startDate: '2026-11-02',
    endDate: '2026-11-10',
    status: 'Planned',
    category: 'Road',
    budget: 740000,
    description: 'Repairing damaged road sections.',
  },
]

type ProjectRow = {
  id: string
  name: string
  department: string
  road: string
  start_date: string
  end_date: string
  status: string
  category: string
  budget: number | string
  description: string
}

function mapProjectRow(row: ProjectRow): Project {
  const statuses: ProjectStatus[] = ['Planned', 'In Progress', 'Completed']
  const categories: ProjectCategory[] = ['Water', 'Drainage', 'Road', 'Telecom']

  return {
    id: row.id,
    name: row.name,
    department: row.department,
    road: row.road,
    startDate: row.start_date,
    endDate: row.end_date,
    status: statuses.includes(row.status as ProjectStatus)
      ? (row.status as ProjectStatus)
      : 'Planned',
    category: categories.includes(row.category as ProjectCategory)
      ? (row.category as ProjectCategory)
      : 'Road',
    budget: Number(row.budget ?? 0),
    description: row.description ?? '',
  }
}

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

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function datesOverlap(first: Project, second: Project): boolean {
  return (
    first.road.trim().toLowerCase() === second.road.trim().toLowerCase() &&
    first.startDate <= second.endDate &&
    second.startDate <= first.endDate
  )
}

function getConflicts(projects: Project[]) {
  const conflicts: { first: Project; second: Project }[] = []

  for (let i = 0; i < projects.length; i += 1) {
    for (let j = i + 1; j < projects.length; j += 1) {
      if (datesOverlap(projects[i], projects[j])) {
        conflicts.push({ first: projects[i], second: projects[j] })
      }
    }
  }

  return conflicts
}

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0)
  const [projectDataMessage, setProjectDataMessage] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [simulatorProjectId, setSimulatorProjectId] = useState('')
  const [proposedStart, setProposedStart] = useState('2026-10-19')
  const [proposedEnd, setProposedEnd] = useState('2026-10-25')
  const [simulationMessage, setSimulationMessage] = useState('')
  const [scheduleBusy, setScheduleBusy] = useState(false)

  useEffect(() => {
    let active = true

    async function loadProjects() {
      setProjectsLoading(true)
      setProjectDataMessage('')

      const { data, error } = await supabase
        .from('projects')
        .select(
          'id, name, department, road, start_date, end_date, status, category, budget, description',
        )
        .order('start_date', { ascending: true })

      if (!active) return

      if (error) {
        setProjectDataMessage(
          `Unable to load projects from Supabase: ${error.message}`,
        )
        setProjects([])
      } else {
        const loadedProjects = ((data ?? []) as ProjectRow[]).map(mapProjectRow)
        setProjects(loadedProjects)

        if (loadedProjects.length === 0) {
          setProjectDataMessage(
            'The projects table is empty. Run the seed SQL in Supabase to add the six demo projects.',
          )
        }
      }

      setProjectsLoading(false)
    }

    void loadProjects()

    return () => {
      active = false
    }
  }, [projectsRefreshKey])

  useEffect(() => {
    if (projects.length === 0) {
      setSimulatorProjectId('')
      return
    }

    const selectedExists = projects.some(
      (project) => project.id === simulatorProjectId,
    )

    if (!selectedExists) {
      const preferredProject =
        projects.find((project) => project.name === 'Drainage System Upgrade') ??
        projects[0]

      setSimulatorProjectId(preferredProject.id)
      setProposedStart(preferredProject.startDate)
      setProposedEnd(preferredProject.endDate)
    }
  }, [projects, simulatorProjectId])

  const conflicts = useMemo(() => getConflicts(projects), [projects])

  const mapProjects = useMemo(
    () =>
      projects.map((project) => ({
        id: project.id,
        name: project.name,
        department: project.department,
        road: project.road,
        start: project.startDate,
        end: project.endDate,
        category: project.category,
      })),
    [projects],
  )

  const plannedCount = projects.filter(
    (project) => project.status === 'Planned',
  ).length

  const ongoingCount = projects.filter(
    (project) => project.status === 'In Progress',
  ).length

  const completedCount = projects.filter(
    (project) => project.status === 'Completed',
  ).length

  const selectedSimulationProject = projects.find(
    (project) => project.id === simulatorProjectId,
  )

  function selectMapProject(mapProject: { id: string }) {
    const matchingProject = projects.find(
      (project) => project.id === mapProject.id,
    )

    if (matchingProject) setSelectedProject(matchingProject)
  }

  function getProjectConflictsForRange(
    candidateProject: Project,
    allProjects: Project[],
  ) {
    return allProjects.filter(
      (project) =>
        project.id !== candidateProject.id &&
        datesOverlap(candidateProject, project),
    )
  }

  function runSimulation() {
    if (!selectedSimulationProject) {
      setSimulationMessage('Please select a valid project.')
      return
    }

    if (!proposedStart || !proposedEnd) {
      setSimulationMessage('Please select both start and end dates.')
      return
    }

    if (proposedEnd < proposedStart) {
      setSimulationMessage('The end date must be on or after the start date.')
      return
    }

    const simulatedProject: Project = {
      ...selectedSimulationProject,
      startDate: proposedStart,
      endDate: proposedEnd,
    }

    const simulatedConflicts = getProjectConflictsForRange(
      simulatedProject,
      projects,
    )

    if (simulatedConflicts.length === 0) {
      setSimulationMessage('No scheduling conflicts detected for these dates.')
      return
    }

    const conflictNames = simulatedConflicts
      .map((project) => project.name)
      .join(', ')

    setSimulationMessage(
      `Potential conflict with ${conflictNames}. Consider changing the dates.`,
    )
  }

  async function verifyAdministrator(): Promise<boolean> {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      setSimulationMessage(
        'Please sign in with the administrator account in Citizen Reports before saving a schedule.',
      )
      return false
    }

    const { data, error } = await supabase.rpc('is_civic_admin')

    if (error || data !== true) {
      setSimulationMessage(
        'Only the CivicSync administrator can save project schedules. Check administrator sign-in in Citizen Reports.',
      )
      return false
    }

    return true
  }

  async function applySchedule() {
    if (!selectedSimulationProject) {
      setSimulationMessage('Please select a valid project.')
      return
    }

    if (!proposedStart || !proposedEnd || proposedEnd < proposedStart) {
      setSimulationMessage('Please enter a valid date range.')
      return
    }

    const updatedProject: Project = {
      ...selectedSimulationProject,
      startDate: proposedStart,
      endDate: proposedEnd,
    }

    const conflictingProjects = getProjectConflictsForRange(
      updatedProject,
      projects,
    )

    if (conflictingProjects.length > 0) {
      const conflictNames = conflictingProjects
        .map((project) => project.name)
        .join(', ')

      setSimulationMessage(
        `Cannot apply this schedule because it conflicts with ${conflictNames}.`,
      )
      return
    }

    setScheduleBusy(true)
    setSimulationMessage('Checking administrator permissions...')

    try {
      const isAdmin = await verifyAdministrator()
      if (!isAdmin) return

      const { error } = await supabase
        .from('projects')
        .update({
          start_date: proposedStart,
          end_date: proposedEnd,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSimulationProject.id)

      if (error) {
        setSimulationMessage(`Unable to save the schedule: ${error.message}`)
        return
      }

      setProjects((current) =>
        current.map((project) =>
          project.id === selectedSimulationProject.id
            ? updatedProject
            : project,
        ),
      )

      setSimulationMessage(
        'Schedule saved to Supabase. It will remain after refresh.',
      )
      setSelectedProject(null)
    } finally {
      setScheduleBusy(false)
    }
  }

  async function resetSchedule() {
    setScheduleBusy(true)
    setSimulationMessage('Checking administrator permissions...')

    try {
      const isAdmin = await verifyAdministrator()
      if (!isAdmin) return

      const resetResults = await Promise.all(
        initialProjects.map((original) =>
          supabase
            .from('projects')
            .update({
              start_date: original.startDate,
              end_date: original.endDate,
              updated_at: new Date().toISOString(),
            })
            .eq('name', original.name),
        ),
      )

      const failedUpdate = resetResults.find((result) => result.error)

      if (failedUpdate?.error) {
        setSimulationMessage(
          `Unable to reset schedules: ${failedUpdate.error.message}`,
        )
        return
      }

      const { data, error } = await supabase
        .from('projects')
        .select(
          'id, name, department, road, start_date, end_date, status, category, budget, description',
        )
        .order('start_date', { ascending: true })

      if (error) {
        setSimulationMessage(
          `Schedules were reset, but reloading failed: ${error.message}`,
        )
        return
      }

      const loadedProjects = ((data ?? []) as ProjectRow[]).map(mapProjectRow)
      setProjects(loadedProjects)

      const preferredProject =
        loadedProjects.find(
          (project) => project.name === 'Drainage System Upgrade',
        ) ?? loadedProjects[0]

      if (preferredProject) {
        setSimulatorProjectId(preferredProject.id)
        setProposedStart(preferredProject.startDate)
        setProposedEnd(preferredProject.endDate)
      }

      setSimulationMessage('Demo schedule dates restored in Supabase.')
      setSelectedProject(null)
    } finally {
      setScheduleBusy(false)
    }
  }

  function renderProjectStatus(status: ProjectStatus) {
    return (
      <span
        className={`project-status status-${status
          .toLowerCase()
          .replace(' ', '-')}`}
      >
        {status}
      </span>
    )
  }

  function renderConflictList() {
    if (conflicts.length === 0) {
      return (
        <div className="empty-state">
          <h3>No conflicts detected</h3>
          <p>
            No projects currently share a road during overlapping date ranges.
          </p>
        </div>
      )
    }

    return (
      <div className="conflict-list">
        {conflicts.map(({ first, second }) => (
          <article
            className="conflict-card"
            key={`${first.id}-${second.id}`}
          >
            <div className="conflict-card-heading">
              <span className="conflict-symbol">⚠</span>
              <div>
                <h4>{first.road}</h4>
                <p>Overlapping work on the same road</p>
              </div>
            </div>

            <div className="conflict-project">
              <strong>{first.name}</strong>
              <span>
                {formatDate(first.startDate)} – {formatDate(first.endDate)}
              </span>
            </div>

            <div className="conflict-project">
              <strong>{second.name}</strong>
              <span>
                {formatDate(second.startDate)} – {formatDate(second.endDate)}
              </span>
            </div>
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <div>
            <h1>CivicSync</h1>
            <p>SMART CITY COORDINATION</p>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map(([icon, label]) => (
            <button
              type="button"
              key={label}
              className={`nav-item ${activeNav === label ? 'active' : ''}`}
              onClick={() => setActiveNav(label)}
            >
              <span className="nav-icon">{icon}</span>
              <span>{label}</span>
              {label === 'Conflicts' && conflicts.length > 0 && (
                <span className="nav-count">{conflicts.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="system-status">
            <span className="status-dot" />
            <div>
              <strong>System operational</strong>
              <p>Prototype environment</p>
            </div>
          </div>

          <div className="profile">
            <div className="profile-avatar">CS</div>
            <div>
              <strong>City Administrator</strong>
              <p>Demo workspace</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">CivicSync / {activeNav}</p>
            <h2>{activeNav}</h2>
          </div>

          <div className="topbar-actions">
            <span className="environment-tag">DEMO DATA</span>
            <button
              type="button"
              className="notification-button"
              aria-label="View conflicts"
              onClick={() => setActiveNav('Conflicts')}
            >
              ♧
              {conflicts.length > 0 && (
                <span className="notification-dot" />
              )}
            </button>
            <div className="topbar-avatar">CA</div>
          </div>
        </header>

        {activeNav === 'Citizen Reports' ? (
          <CitizenReports />
        ) : (
          <>
            {projectDataMessage && (
              <div className="panel" role="status">
                <p>{projectDataMessage}</p>
              </div>
            )}

            {activeNav === 'Dashboard' && (
              <section className="welcome-banner">
                <div className="welcome-copy">
                  <p className="welcome-eyebrow">
                    CITY INFRASTRUCTURE COORDINATION
                  </p>
                  <h2>Plan better. Build smarter.</h2>
                  <p>
                    Coordinate public works, identify scheduling conflicts,
                    and improve visibility across city infrastructure projects.
                  </p>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => setActiveNav('Schedule Simulator')}
                  >
                    Open Schedule Simulator <span>→</span>
                  </button>
                </div>

                <div className="city-illustration" aria-hidden="true">
                  <div className="city-sun" />
                  <div className="city-building building-one">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="city-building building-two">
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="city-building building-three">
                    <span />
                    <span />
                  </div>
                  <div className="city-road">
                    <span />
                  </div>
                  <div className="city-tree tree-one">♣</div>
                  <div className="city-tree tree-two">♣</div>
                </div>
              </section>
            )}

            {activeNav === 'Dashboard' && (
              <section className="metric-grid">
                <article className="metric-card">
                  <div className="metric-top">
                    <span>Total projects</span>
                    <span className="metric-icon blue">▤</span>
                  </div>
                  <strong>{projectsLoading ? '…' : projects.length}</strong>
                  <p>Tracked infrastructure projects</p>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span>Active projects</span>
                    <span className="metric-icon green">↗</span>
                  </div>
                  <strong>{ongoingCount}</strong>
                  <p>Currently in progress</p>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span>Scheduling conflicts</span>
                    <span className="metric-icon red">⚠</span>
                  </div>
                  <strong>{conflicts.length}</strong>
                  <p>Potential date and location overlaps</p>
                </article>

                <article className="metric-card">
                  <div className="metric-top">
                    <span>Planned projects</span>
                    <span className="metric-icon purple">◷</span>
                  </div>
                  <strong>{plannedCount}</strong>
                  <p>{completedCount} completed</p>
                </article>
              </section>
            )}

            {(activeNav === 'Dashboard' ||
              activeNav === 'Public Works Map') && (
              <section className="panel map-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Public Works Overview</h3>
                    <p>
                      Select a marker to inspect an infrastructure project.
                    </p>
                  </div>
                  {activeNav === 'Dashboard' && (
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setActiveNav('Public Works Map')}
                    >
                      Expand map →
                    </button>
                  )}
                </div>

                {projectsLoading ? (
                  <div className="empty-state">
                    <p>Loading projects from Supabase...</p>
                  </div>
                ) : (
                  <ProjectMap
                    projects={mapProjects}
                    onSelect={selectMapProject}
                  />
                )}

                {selectedProject && (
                  <div className="selected-project-detail">
                    <h4>{selectedProject.name}</h4>
                    <p>
                      {selectedProject.road} · {selectedProject.department}
                    </p>
                    <p>
                      {formatDate(selectedProject.startDate)} –{' '}
                      {formatDate(selectedProject.endDate)}
                    </p>
                    {renderProjectStatus(selectedProject.status)}
                  </div>
                )}

                <p className="demo-disclaimer">
                  Map locations are illustrative demo data, not verified
                  municipal coordinates.
                </p>
              </section>
            )}

            {activeNav === 'Dashboard' && (
              <section className="panel conflict-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Conflict Detection</h3>
                    <p>Potential scheduling overlaps</p>
                  </div>
                  <span className="conflict-badge">
                    {conflicts.length} detected
                  </span>
                </div>

                {projectsLoading ? (
                  <p>Checking project schedules...</p>
                ) : (
                  renderConflictList()
                )}

                <button
                  type="button"
                  className="secondary-button full-width-button"
                  onClick={() => setActiveNav('Conflicts')}
                >
                  View all conflicts →
                </button>
              </section>
            )}

            {activeNav === 'Conflicts' && (
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Scheduling Conflicts</h3>
                    <p>
                      Projects on the same road with overlapping date ranges.
                    </p>
                  </div>
                  <span className="conflict-badge">
                    {conflicts.length} detected
                  </span>
                </div>
                {projectsLoading ? <p>Loading schedules...</p> : renderConflictList()}
              </section>
            )}

            {activeNav === 'Projects' && (
              <ProjectManagement
                projects={projects}
                loading={projectsLoading}
                onProjectsChanged={() =>
                  setProjectsRefreshKey((current) => current + 1)
                }
              />
            )}

            {activeNav === 'Schedule Simulator' && (
              <section className="panel simulator-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Schedule Simulator</h3>
                    <p>
                      Test a proposed schedule before applying it to a project.
                    </p>
                  </div>
                  <span className="environment-tag">WHAT-IF ANALYSIS</span>
                </div>

                <div className="simulator-form">
                  <div className="simulator-field">
                    <label htmlFor="sim-project">Project</label>
                    <select
                      id="sim-project"
                      value={simulatorProjectId}
                      onChange={(event) => {
                        const nextId = event.target.value
                        const nextProject = projects.find(
                          (project) => project.id === nextId,
                        )

                        setSimulatorProjectId(nextId)

                        if (nextProject) {
                          setProposedStart(nextProject.startDate)
                          setProposedEnd(nextProject.endDate)
                        }

                        setSimulationMessage('')
                      }}
                      disabled={projectsLoading || projects.length === 0}
                    >
                      {projects.length === 0 && (
                        <option value="">No projects available</option>
                      )}
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="simulator-field">
                    <label htmlFor="sim-start">Proposed start date</label>
                    <input
                      id="sim-start"
                      type="date"
                      value={proposedStart}
                      onChange={(event) => {
                        setProposedStart(event.target.value)
                        setSimulationMessage('')
                      }}
                    />
                  </div>

                  <div className="simulator-field">
                    <label htmlFor="sim-end">Proposed end date</label>
                    <input
                      id="sim-end"
                      type="date"
                      value={proposedEnd}
                      onChange={(event) => {
                        setProposedEnd(event.target.value)
                        setSimulationMessage('')
                      }}
                    />
                  </div>
                </div>

                {selectedSimulationProject && (
                  <div className="current-schedule">
                    <span>Current schedule</span>
                    <strong>
                      {formatDate(selectedSimulationProject.startDate)} –{' '}
                      {formatDate(selectedSimulationProject.endDate)}
                    </strong>
                  </div>
                )}

                <div className="simulator-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={runSimulation}
                    disabled={projectsLoading || !selectedSimulationProject}
                  >
                    Check for Conflicts
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => void applySchedule()}
                    disabled={scheduleBusy || projectsLoading || !selectedSimulationProject}
                  >
                    {scheduleBusy ? 'Saving...' : 'Apply Schedule'}
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => void resetSchedule()}
                    disabled={scheduleBusy || projectsLoading || projects.length === 0}
                  >
                    Reset Demo
                  </button>
                </div>

                {simulationMessage && (
                  <div className="simulation-result" role="status">
                    <strong>Simulation result</strong>
                    <p>{simulationMessage}</p>
                  </div>
                )}

                <p className="demo-disclaimer">
                  Saving and resetting schedules requires administrator
                  sign-in through Citizen Reports.
                </p>
              </section>
            )}

            {activeNav === 'Audit Trail' && (
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Audit Trail</h3>
                    <p>Prototype activity information.</p>
                  </div>
                </div>
                <div className="activity-list">
                  <article className="activity-item">
                    <span className="activity-dot green-dot" />
                    <div>
                      <strong>Dashboard initialised</strong>
                      <p>Infrastructure projects loaded from Supabase.</p>
                    </div>
                    <span>Demo</span>
                  </article>
                  <article className="activity-item">
                    <span className="activity-dot blue-dot" />
                    <div>
                      <strong>Conflict analysis enabled</strong>
                      <p>
                        Same-road projects are checked for overlapping dates.
                      </p>
                    </div>
                    <span>Available</span>
                  </article>
                  <article className="activity-item">
                    <span className="activity-dot orange-dot" />
                    <div>
                      <strong>Citizen reporting module</strong>
                      <p>Reports are stored in the shared Supabase database.</p>
                    </div>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setActiveNav('Citizen Reports')}
                    >
                      Open reports →
                    </button>
                  </article>
                </div>
                <p className="demo-disclaimer">
                  This is a demonstration feed, not a permanent server-side
                  audit log.
                </p>
              </section>
            )}

            {activeNav === 'Settings' && (
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h3>Settings</h3>
                    <p>Prototype environment information.</p>
                  </div>
                </div>
                <div className="settings-list">
                  <div>
                    <strong>Application</strong>
                    <span>CivicSync</span>
                  </div>
                  <div>
                    <strong>Environment</strong>
                    <span>Supabase-backed prototype</span>
                  </div>
                  <div>
                    <strong>Project data</strong>
                    <span>Stored in Supabase</span>
                  </div>
                  <div>
                    <strong>Citizen reports</strong>
                    <span>Stored in the shared Supabase database</span>
                  </div>
                </div>
              </section>
            )}

            {activeNav === 'Dashboard' && (
              <>
                <section className="panel projects-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Recent Projects</h3>
                      <p>Infrastructure work across departments.</p>
                    </div>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setActiveNav('Projects')}
                    >
                      View all →
                    </button>
                  </div>

                  <div className="project-table-wrap">
                    <table className="project-table">
                      <thead>
                        <tr>
                          <th>Project</th>
                          <th>Department</th>
                          <th>Location</th>
                          <th>End date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.slice(0, 5).map((project) => (
                          <tr key={project.id}>
                            <td>
                              <strong>{project.name}</strong>
                              <small>{project.category}</small>
                            </td>
                            <td>{project.department}</td>
                            <td>{project.road}</td>
                            <td>{formatDate(project.endDate)}</td>
                            <td>{renderProjectStatus(project.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="bottom-grid">
                  <article className="info-card">
                    <div className="info-card-icon">↔</div>
                    <div>
                      <h3>Cross-department coordination</h3>
                      <p>
                        Identify overlapping work before multiple teams occupy
                        the same road.
                      </p>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => setActiveNav('Conflicts')}
                      >
                        Review conflicts →
                      </button>
                    </div>
                  </article>

                  <article className="info-card">
                    <div className="info-card-icon">♧</div>
                    <div>
                      <h3>Citizen participation</h3>
                      <p>
                        Submit infrastructure complaints and track their
                        progress.
                      </p>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => setActiveNav('Citizen Reports')}
                      >
                        Open citizen reports →
                      </button>
                    </div>
                  </article>
                </section>
              </>
            )}
          </>
        )}

        <footer className="app-footer">
          <span>CivicSync · Smart City Coordination</span>
          <span>Hackathon prototype · Demo data only</span>
        </footer>
      </main>
    </div>
  )
}

export default App
