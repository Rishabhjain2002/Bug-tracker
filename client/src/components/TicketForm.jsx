import { useState } from 'react';
import { getErrorMessage } from '../api/client';
import { PRIORITIES, STATUSES } from '../constants';

// Shared by the create and edit ticket pages; readOnly shows the ticket without editing
export default function TicketForm({ initialValues, projects, users, onSubmit, submitLabel, readOnly = false }) {
  const [form, setForm] = useState(initialValues);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({ ...form, assignee_id: form.assignee_id || null });
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      {/* A disabled fieldset disables every input inside it */}
      <fieldset className="form" disabled={readOnly}>
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} required maxLength={200} />
        </label>

        <label>
          Description
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} />
        </label>

        <div className="form-grid">
          <label>
            Project
            <select name="project_id" value={form.project_id} onChange={handleChange} required>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>

          <label>
            Assignee
            <select name="assignee_id" value={form.assignee_id} onChange={handleChange}>
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </label>

          <label>
            Priority
            <select name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>

          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </fieldset>

      {!readOnly && (
        <button className="btn" type="submit" disabled={saving}>
          {saving ? 'Saving...' : submitLabel}
        </button>
      )}
    </form>
  );
}
