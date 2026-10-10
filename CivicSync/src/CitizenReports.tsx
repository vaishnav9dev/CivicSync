
import { useEffect, useState, type FormEvent } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import './CitizenReports.css'

type ReportStatus = 'Submitted' | 'Under Review' | 'Resolved'
type Priority = 'Low' | 'Medium' | 'High'

type CitizenReport = {
  dbId: string
  id: string
  issue: string
  location: string
  priority: Priority
  description: string
  status: ReportStatus
  createdAt: string
}

type DatabaseReport = {
  id: string
  title: string
  description: string
  category: string
  priority: string
  location: string
  status: string
  created_at: string
}

function mapDatabaseReport(row: DatabaseReport): CitizenReport {
  const validPriorities: Priority[] = ['Low', 'Medium', 'High']
  const validStatuses: ReportStatus[] = [
    'Submitted',
    'Under Review',
    'Resolved',
  ]

  return {
    dbId: row.id,
    id: `CIV-${row.id.slice(-8).toUpperCase()}`,
    issue: row.category || row.title,
    location: row.location,
    priority: validPriorities.includes(row.priority as Priority)
      ? (row.priority as Priority)
      : 'Medium',
    description: row.description,
    status: validStatuses.includes(row.status as ReportStatus)
      ? (row.status as ReportStatus)
      : 'Submitted',
    createdAt: new Date(row.created_at).toISOString().slice(0, 10),
  }
}

export default function CitizenReports() {
  const [reports, setReports] = useState<CitizenReport[]>([])
  const [issue, setIssue] = useState('Road Damage')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [description, setDescription] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authBusy, setAuthBusy] = useState(false)

  // Restore the session and respond to login/logout events.
  useEffect(() => {
    let active = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null)
        setMessage('')
      }
    })

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return

      if (error) {
        setMessage(`Unable to check sign-in status: ${error.message}`)
        return
      }

      setUser(data.session?.user ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  // Determine the admin role from the protected database function.
  useEffect(() => {
    let active = true

    async function checkAdminRole() {
      setIsAdmin(false)

      if (!user) {
        setCheckingAdmin(false)
        return
      }

      setCheckingAdmin(true)

      const { data, error } = await supabase.rpc('is_civic_admin')

      if (!active) return

      setIsAdmin(!error && data === true)
      setCheckingAdmin(false)

      if (error) {
        setMessage(`Unable to verify administrator access: ${error.message}`)
      } else if (data !== true) {
        setMessage('Signed in, but this account does not have administrator access.')
      }
    }

    void checkAdminRole()

    return () => {
      active = false
    }
  }, [user])

  // Load shared reports from Supabase.
  useEffect(() => {
    let active = true

    async function loadReports() {
      setLoading(true)

      const { data, error } = await supabase
        .from('citizen_reports')
        .select(
          'id, title, description, category, priority, location, status, created_at',
        )
        .order('created_at', { ascending: false })

      if (!active) return

      if (error) {
        setMessage(`Unable to load reports: ${error.message}`)
      } else {
        setReports((data ?? []).map((row) =>
          mapDatabaseReport(row as DatabaseReport),
        ))
      }

      setLoading(false)
    }

    void loadReports()

    return () => {
      active = false
    }
  }, [])

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthBusy(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    setAuthBusy(false)

    if (error) {
      setMessage(`Sign-in failed: ${error.message}`)
      return
    }

    setPassword('')
    setShowLogin(false)
    setMessage('Signed in. Verifying administrator permissions...')
  }

  async function signOut() {
    setAuthBusy(true)

    const { error } = await supabase.auth.signOut()

    setAuthBusy(false)

    if (error) {
      setMessage(`Sign-out failed: ${error.message}`)
      return
    }

    setIsAdmin(false)
    setMessage('You have signed out.')
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanLocation = location.trim()
    const cleanDescription = description.trim()

    if (!cleanLocation || !cleanDescription) {
      setMessage('Please enter a location and description.')
      return
    }

    setSubmitting(true)
    setMessage('')

    const { data, error } = await supabase
      .from('citizen_reports')
      .insert({
        title: issue,
        description: cleanDescription,
        category: issue,
        priority,
        location: cleanLocation,
        status: 'Submitted',
      })
      .select(
        'id, title, description, category, priority, location, status, created_at',
      )
      .single()

    setSubmitting(false)

    if (error) {
      setMessage(`Report submission failed: ${error.message}`)
      return
    }

    const newReport = mapDatabaseReport(data as DatabaseReport)

    setReports((current) => [newReport, ...current])
    setIssue('Road Damage')
    setLocation('')
    setPriority('Medium')
    setDescription('')
    setSearch('')
    setStatusFilter('All')
    setMessage(`Report submitted successfully. Reference: ${newReport.id}`)
  }

  async function updateStatus(dbId: string, status: ReportStatus) {
    if (!user || !isAdmin) {
      setMessage('Only an authenticated administrator can update statuses.')
      return
    }

    const previousReports = reports
    const report = reports.find((item) => item.dbId === dbId)

    if (!report || report.status === status) return

    setUpdatingId(dbId)
    setMessage('')

    const { error } = await supabase
      .from('citizen_reports')
      .update({ status })
      .eq('id', dbId)

    setUpdatingId(null)

    if (error) {
      setMessage(`Status update failed: ${error.message}`)
      return
    }

    setReports(previousReports.map((item) =>
      item.dbId === dbId ? { ...item, status } : item,
    ))

    setMessage(`Report ${report.id} updated to ${status}.`)
  }

  const visibleReports = reports.filter((report) => {
    const searchableText =
      `${report.id} ${report.issue} ${report.location} ${report.description}`.toLowerCase()

    return (
      searchableText.includes(search.toLowerCase()) &&
      (statusFilter === 'All' || report.status === statusFilter)
    )
  })

  const submittedCount = reports.filter(
    (report) => report.status === 'Submitted',
  ).length

  const reviewCount = reports.filter(
    (report) => report.status === 'Under Review',
  ).length

  const resolvedCount = reports.filter(
    (report) => report.status === 'Resolved',
  ).length

  return (
    <section className="citizen-reports">
      <div className="cr-heading">
        <div>
          <p className="cr-eyebrow">COMMUNITY PARTICIPATION</p>
          <h2>Citizen Reports</h2>
          <p className="cr-muted">
            Report infrastructure problems and track their progress.
          </p>
        </div>
        <span className="cr-demo-tag">
          {isAdmin ? 'ADMINISTRATOR' : 'PROTOTYPE'}
        </span>
      </div>

      <div className="cr-form" style={{ marginBottom: '16px' }}>
        <div className="cr-form-heading">
          <h3>Administrator access</h3>
          <p>
            {checkingAdmin
              ? 'Checking administrator permissions...'
              : isAdmin
                ? `Signed in as ${user?.email ?? 'administrator'}`
                : user
                  ? `Signed in as ${user.email ?? 'user'} — administrator access not granted`
                  : 'Sign in with your registered administrator account to update report statuses.'}
          </p>
        </div>

        {!user && !showLogin && (
          <button
            className="cr-submit"
            type="button"
            onClick={() => setShowLogin(true)}
          >
            Administrator sign in
          </button>
        )}

        {!user && showLogin && (
          <form onSubmit={signIn}>
            <label htmlFor="cr-admin-email">Email address</label>
            <input
              id="cr-admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="cr-admin-password">Password</label>
            <input
              id="cr-admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <button className="cr-submit" type="submit" disabled={authBusy}>
              {authBusy ? 'Signing in...' : 'Sign in'}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowLogin(false)
                setPassword('')
              }}
              disabled={authBusy}
            >
              Cancel
            </button>
          </form>
        )}

        {user && (
          <button
            type="button"
            className="cr-submit"
            onClick={() => void signOut()}
            disabled={authBusy}
          >
            {authBusy ? 'Please wait...' : 'Sign out'}
          </button>
        )}

        {message && (
          <p className="cr-message" role="status">
            {message}
          </p>
        )}
      </div>

      <div className="cr-stats">
        <article>
          <span>Total reports</span>
          <strong>{reports.length}</strong>
        </article>
        <article>
          <span>Submitted</span>
          <strong>{submittedCount}</strong>
        </article>
        <article>
          <span>Under review</span>
          <strong>{reviewCount}</strong>
        </article>
        <article>
          <span>Resolved</span>
          <strong>{resolvedCount}</strong>
        </article>
      </div>

      <div className="cr-layout">
        <form className="cr-form" onSubmit={submitReport}>
          <div className="cr-form-heading">
            <h3>Report an issue</h3>
            <p>Provide details about the infrastructure problem.</p>
          </div>

          <label htmlFor="cr-issue">Issue category</label>
          <select
            id="cr-issue"
            value={issue}
            onChange={(event) => setIssue(event.target.value)}
          >
            <option>Road Damage</option>
            <option>Drainage Blockage</option>
            <option>Water Leakage</option>
            <option>Broken Streetlight</option>
            <option>Waste Accumulation</option>
            <option>Other</option>
          </select>

          <label htmlFor="cr-location">Road or location</label>
          <input
            id="cr-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="e.g. Main Road, near bus stop"
            maxLength={120}
            required
          />

          <label htmlFor="cr-priority">Priority</label>
          <select
            id="cr-priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as Priority)
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <label htmlFor="cr-description">Description</label>
          <textarea
            id="cr-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the problem and nearby landmarks..."
            rows={4}
            maxLength={1000}
            required
          />

          <p className="cr-character-count">
            {description.length}/1000 characters
          </p>

          <button
            className="cr-submit"
            type="submit"
            disabled={submitting || loading}
          >
            {submitting ? 'Submitting...' : '+ Submit Report'}
          </button>

          <p className="cr-disclaimer">
            Prototype only. Reports are stored in the shared database and
            may be visible to other users. Do not enter sensitive personal
            information.
          </p>
        </form>

        <div className="cr-list-panel">
          <div className="cr-list-heading">
            <h3>Report register</h3>
            <p>Search reports and view their current status.</p>
          </div>

          <div className="cr-filters">
            <input
              aria-label="Search reports"
              placeholder="Search reports..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="cr-report-list">
            {loading && (
              <div className="cr-empty">
                <p>Loading reports from the database...</p>
              </div>
            )}

            {!loading && visibleReports.length === 0 && (
              <div className="cr-empty">
                <h3>No reports found</h3>
                <p>Try a different search or filter, or submit a report.</p>
              </div>
            )}

            {visibleReports.map((report) => (
              <article className="cr-report-card" key={report.dbId}>
                <div className="cr-report-top">
                  <span className="cr-report-id">{report.id}</span>
                  <span
                    className={`cr-priority priority-${report.priority.toLowerCase()}`}
                  >
                    {report.priority} priority
                  </span>
                </div>

                <h4>{report.issue}</h4>
                <p className="cr-report-location">⌖ {report.location}</p>
                <p className="cr-report-description">{report.description}</p>

                <div className="cr-report-bottom">
                  <span
                    className={`cr-status status-${report.status.toLowerCase().replace(' ', '-')}`}
                  >
                    {report.status}
                  </span>
                  <span className="cr-report-date">{report.createdAt}</span>
                </div>

                <label
                  className="cr-status-label"
                  htmlFor={`status-${report.dbId}`}
                >
                  {isAdmin ? 'Update status' : 'Status (administrator access required)'}
                </label>

                <select
                  id={`status-${report.dbId}`}
                  value={report.status}
                  disabled={!isAdmin || checkingAdmin || updatingId === report.dbId}
                  onChange={(event) =>
                    void updateStatus(
                      report.dbId,
                      event.target.value as ReportStatus,
                    )
                  }
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
