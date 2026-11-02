import { useState } from 'react';
import { getErrorMessage } from '../api/client';
import { PRIORITIES, STATUSES } from '../constants';

// Used for creating, editing and (readOnly) viewing a ticket
export default function TicketForm({ initialValues, projects, users, onSubmit, onCancel, submitLabel, readOnly = false }) {
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
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}

      {/* A disabled fieldset disables every input inside it */}
      <fieldset className="ticket-form" disabled={readOnly}>
        <div className="ticket-form-main">
          <label className="field">
            Title
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="What needs to be fixed?"
              required
              maxLength={200}
              autoFocus={!readOnly}
            />
          </label>

          <label className="field">
            Description
            <textarea
              name="description"
              rows={8}
              value={form.description}
              onChange={handleChange}
              placeholder="Steps to reproduce, expected and actual behaviour..."
            />
          </label>
        </div>

        <div className="ticket-form-side">
          <label className="field">
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>

          <label className="field">
            Assignee
            <select name="assignee_id" value={form.assignee_id} onChange={handleChange}>
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </label>

          <label className="field">
            Priority
            <select name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </label>

          <label className="field">
            Project
            <select name="project_id" value={form.project_id} onChange={handleChange} required>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        </div>
      </fieldset>

      <div className="modal-footer">
        <button className="btn btn-secondary" type="button" onClick={onCancel}>
          {readOnly ? 'Close' : 'Cancel'}
        </button>
        {!readOnly && (
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving...' : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}
