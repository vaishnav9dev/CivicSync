
import { useState } from 'react'
import { supabase } from './lib/supabase'
import './ProjectManagement.css'

type ProjectRecord = {
  id: string
  name: string
  department: string
  road: string
  startDate: string
  endDate: string
  status: string
  category: string
  budget: number
  description: string
}

type ProjectForm = {
  name: string
  department: string
  road: string
  startDate: string
  endDate: string
  status: string
  category: string
  budget: string
  description: string
}

type ProjectManagementProps = {
  projects: ProjectRecord[]
  loading: boolean
  onProjectsChanged: () => void
}

const emptyForm: ProjectForm = {
  name: '',
  department: 'Public Works',
  road: '',
  startDate: '',
  endDate: '',
  status: 'Planned',
  category: 'Road',
  budget: '0',
  description: '',
}

function toForm(project: ProjectRecord): ProjectForm {
  return {
    name: project.name,
    department: project.department,
    road: project.road,
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status,
    category: project.category,
    budget: String(project.budget),
    description: project.description,
  }
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ProjectManagement({
  projects,
  loading,
  onProjectsChanged,
}: ProjectManagementProps) {
  const [form, setForm] = useState<ProjectForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>(
    'success',
  )

  function updateField<K extends keyof ProjectForm>(
    field: K,
    value: ProjectForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function cancelEditing() {
    setEditingId(null)
    setForm(emptyForm)
    setMessage('')
  }

  async function verifyAdministrator(): Promise<boolean> {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      setMessage(
        'Please sign in with your administrator account through Citizen Reports first.',
      )
      setMessageType('error')
      return false
    }

    const { data, error } = await supabase.rpc('is_civic_admin')

    if (error || data !== true) {
      setMessage(
        'Administrator permission was not verified. Check your account and Supabase policies.',
      )
      setMessageType('error')
      return false
    }

    return true
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!form.name.trim() || !form.department.trim() || !form.road.trim()) {
      setMessage('Enter the project name, department, and road.')
      setMessageType('error')
      return
    }

    if (!form.startDate || !form.endDate || form.endDate < form.startDate) {
      setMessage('Choose valid dates. The end date must not precede the start date.')
      setMessageType('error')
      return
    }

    const budget = Number(form.budget)

    if (!Number.isFinite(budget) || budget < 0) {
      setMessage('Budget must be a valid non-negative number.')
      setMessageType('error')
      return
    }

    setBusy(true)

    try {
      const isAdmin = await verifyAdministrator()
      if (!isAdmin) return

      const values = {
        name: form.name.trim(),
        department: form.department.trim(),
        road: form.road.trim(),
        start_date: form.startDate,
        end_date: form.endDate,
        status: form.status,
        category: form.category,
        budget,
        description: form.description.trim(),
        updated_at: new Date().toISOString(),
      }

      if (editingId) {
        const { data, error } = await supabase
          .from('projects')
          .update(values)
          .eq('id', editingId)
          .select('id')
          .maybeSingle()

        if (error) {
          setMessage(`Unable to update project: ${error.message}`)
          setMessageType('error')
          return
        }

        if (!data) {
          setMessage(
            'No project was updated. Your administrator permission may be missing.',
          )
          setMessageType('error')
          return
        }

        setMessage('Project updated successfully in Supabase.')
      } else {
        const { error } = await supabase.from('projects').insert(values)

        if (error) {
          setMessage(`Unable to create project: ${error.message}`)
          setMessageType('error')
          return
        }

        setMessage('Project created successfully in Supabase.')
      }

      setMessageType('success')
      setEditingId(null)
      setForm(emptyForm)
      onProjectsChanged()
    } catch {
      setMessage('An unexpected error occurred while saving the project.')
      setMessageType('error')
    } finally {
      setBusy(false)
    }
  }

  async function deleteProject(project: ProjectRecord) {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This permanently removes the project from the database.`,
    )

    if (!confirmed) return

    setBusy(true)
    setMessage('')

    try {
      const isAdmin = await verifyAdministrator()
      if (!isAdmin) return

      const { data, error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)
        .select('id')
        .maybeSingle()

      if (error) {
        setMessage(`Unable to delete project: ${error.message}`)
        setMessageType('error')
        return
      }

      if (!data) {
        setMessage(
          'No project was deleted. Your administrator permission may be missing.',
        )
        setMessageType('error')
        return
      }

      if (editingId === project.id) {
        setEditingId(null)
        setForm(emptyForm)
      }

      setMessage('Project deleted from Supabase.')
      setMessageType('success')
      onProjectsChanged()
    } catch {
      setMessage('An unexpected error occurred while deleting the project.')
      setMessageType('error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel project-management">
      <div className="panel-heading">
        <div>
          <h3>Manage Infrastructure Projects</h3>
          <p>Create, edit, or remove projects in the shared database.</p>
        </div>
        <span className="environment-tag">{projects.length} PROJECTS</span>
      </div>

      <form className="pm-form" onSubmit={handleSubmit}>
        <h4>{editingId ? 'Edit project' : 'Add a project'}</h4>

        <div className="pm-form-grid">
          <label>
            Project name
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              maxLength={150}
              required
              placeholder="e.g. Road Repair Phase 2"
            />
          </label>

          <label>
            Department
            <input
              value={form.department}
              onChange={(event) =>
                updateField('department', event.target.value)
              }
              maxLength={100}
              required
              placeholder="e.g. Public Works"
            />
          </label>

          <label>
            Road or location
            <input
              value={form.road}
              onChange={(event) => updateField('road', event.target.value)}
              maxLength={150}
              required
              placeholder="e.g. Main Road"
            />
          </label>

          <label>
            Category
            <select
              value={form.category}
              onChange={(event) =>
                updateField('category', event.target.value)
              }
            >
              <option value="Water">Water</option>
              <option value="Drainage">Drainage</option>
              <option value="Road">Road</option>
              <option value="Telecom">Telecom</option>
            </select>
          </label>

          <label>
            Start date
            <input
              type="date"
              value={form.startDate}
              onChange={(event) =>
                updateField('startDate', event.target.value)
              }
              required
            />
          </label>

          <label>
            End date
            <input
              type="date"
              value={form.endDate}
              min={form.startDate || undefined}
              onChange={(event) =>
                updateField('endDate', event.target.value)
              }
              required
            />
          </label>

          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
            >
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>

          <label>
            Budget
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.budget}
              onChange={(event) => updateField('budget', event.target.value)}
              required
            />
          </label>

          <label className="pm-description-field">
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              maxLength={2000}
              rows={3}
              placeholder="Describe the planned infrastructure work."
            />
          </label>
        </div>

        <div className="pm-form-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={busy || loading}
          >
            {busy
              ? 'Saving...'
              : editingId
                ? 'Save Changes'
                : 'Create Project'}
          </button>

          {editingId && (
            <button
              type="button"
              className="secondary-button"
              onClick={cancelEditing}
              disabled={busy}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {message && (
        <p
          className={`pm-message ${messageType}`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}

      <div className="pm-project-list">
        <h4>Project register</h4>

        {loading ? (
          <p>Loading projects from Supabase...</p>
        ) : projects.length === 0 ? (
          <p>No projects are currently available.</p>
        ) : (
          projects.map((project) => (
            <article className="pm-project-card" key={project.id}>
              <div className="pm-project-details">
                <strong>{project.name}</strong>
                <span>
                  {project.department} · {project.road}
                </span>
                <span>
                  {formatDate(project.startDate)} –{' '}
                  {formatDate(project.endDate)}
                </span>
                <span>
                  {project.category} · {project.status} · Budget:{' '}
                  {Number(project.budget).toLocaleString('en-IN')}
                </span>
                {project.description && <p>{project.description}</p>}
              </div>

              <div className="pm-project-actions">
                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy}
                  onClick={() => {
                    setEditingId(project.id)
                    setForm(toForm(project))
                    setMessage('')
                  }}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="pm-delete-button"
                  disabled={busy}
                  onClick={() => void deleteProject(project)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
