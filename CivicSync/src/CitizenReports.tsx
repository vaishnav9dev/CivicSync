
import { useEffect, useState, type FormEvent } from 'react'
import './CitizenReports.css'

type ReportStatus = 'Submitted' | 'Under Review' | 'Resolved'
type Priority = 'Low' | 'Medium' | 'High'

type CitizenReport = {
  id: string
  issue: string
  location: string
  priority: Priority
  description: string
  status: ReportStatus
  createdAt: string
}

const STORAGE_KEY = 'civicsync-citizen-reports'

const initialReports: CitizenReport[] = [
  {
    id: 'CIV-DEMO-001',
    issue: 'Road Damage',
    location: 'Main Road',
    priority: 'High',
    description: 'Sample report demonstrating a road damage complaint.',
    status: 'Under Review',
    createdAt: '2026-10-09',
  },
  {
    id: 'CIV-DEMO-002',
    issue: 'Drainage Blockage',
    location: 'Market Street',
    priority: 'Medium',
    description: 'Sample report demonstrating a drainage complaint.',
    status: 'Submitted',
    createdAt: '2026-10-09',
  },
]

function readReports(): CitizenReport[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        return parsed as CitizenReport[]
      }
    }
  } catch {
    // Fall back to the initial demo reports.
  }

  return initialReports
}

export default function CitizenReports() {
  const [reports, setReports] = useState<CitizenReport[]>(readReports)
  const [issue, setIssue] = useState('Road Damage')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [description, setDescription] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [message, setMessage] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
    } catch {
      setMessage('Unable to save reports in browser storage.')
    }
  }, [reports])

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanLocation = location.trim()
    const cleanDescription = description.trim()

    if (!cleanLocation || !cleanDescription) {
      setMessage('Please enter a location and description.')
      return
    }

    const newReport: CitizenReport = {
      id: `CIV-${Date.now().toString().slice(-8)}`,
      issue,
      location: cleanLocation,
      priority,
      description: cleanDescription,
      status: 'Submitted',
      createdAt: new Date().toISOString().slice(0, 10),
    }

    setReports((current) => [newReport, ...current])
    setIssue('Road Damage')
    setLocation('')
    setPriority('Medium')
    setDescription('')
    setSearch('')
    setStatusFilter('All')
    setMessage(`Report submitted. Reference: ${newReport.id}`)
  }

  function updateStatus(id: string, status: ReportStatus) {
    setReports((current) =>
      current.map((report) =>
        report.id === id ? { ...report, status } : report,
      ),
    )

    setMessage(`Report ${id} updated to ${status}.`)
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
        <span className="cr-demo-tag">PROTOTYPE</span>
      </div>

      <div className="cr-stats">
        <article><span>Total reports</span><strong>{reports.length}</strong></article>
        <article><span>Submitted</span><strong>{submittedCount}</strong></article>
        <article><span>Under review</span><strong>{reviewCount}</strong></article>
        <article><span>Resolved</span><strong>{resolvedCount}</strong></article>
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

          <button className="cr-submit" type="submit">
            + Submit Report
          </button>

          {message && <p className="cr-message" role="status">{message}</p>}

          <p className="cr-disclaimer">
            Prototype only. Reports are saved in this browser. Do not enter
            sensitive personal information.
          </p>
        </form>

        <div className="cr-list-panel">
          <div className="cr-list-heading">
            <h3>Report register</h3>
            <p>Search reports and update their status.</p>
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
            {visibleReports.length === 0 && (
              <div className="cr-empty">
                <h3>No reports found</h3>
                <p>Try a different search or filter.</p>
              </div>
            )}

            {visibleReports.map((report) => (
              <article className="cr-report-card" key={report.id}>
                <div className="cr-report-top">
                  <span className="cr-report-id">{report.id}</span>
                  <span className={`cr-priority priority-${report.priority.toLowerCase()}`}>
                    {report.priority} priority
                  </span>
                </div>

                <h4>{report.issue}</h4>
                <p className="cr-report-location">⌖ {report.location}</p>
                <p className="cr-report-description">{report.description}</p>

                <div className="cr-report-bottom">
                  <span className={`cr-status status-${report.status.toLowerCase().replace(' ', '-')}`}>
                    {report.status}
                  </span>
                  <span className="cr-report-date">{report.createdAt}</span>
                </div>

                <label className="cr-status-label" htmlFor={`status-${report.id}`}>
                  Update status
                </label>
                <select
                  id={`status-${report.id}`}
                  value={report.status}
                  onChange={(event) =>
                    updateStatus(report.id, event.target.value as ReportStatus)
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
