import { PRIORITIES, STATUSES } from '../constants';
import useForm from '../hooks/useForm';
import useSubmit from '../hooks/useSubmit';
import LabelChip from './LabelChip';

// Used for creating, editing and (readOnly) viewing a ticket
export default function TicketForm({ initialValues, projects, users, labels, onSubmit, onCancel, submitLabel, readOnly = false }) {
  const { values: form, handleChange, setValue } = useForm(initialValues);
  const { submit, error, submitting } = useSubmit(onSubmit);

  const toggleLabel = (id) => {
    const labelIds = form.label_ids.includes(id) ? form.label_ids.filter((l) => l !== id) : [...form.label_ids, id];
    setValue('label_ids', labelIds);
  };

  // When viewing read-only, show only the ticket's own labels
  const visibleLabels = readOnly ? labels.filter((l) => form.label_ids.includes(l.id)) : labels;

  const handleSubmit = (e) => {
    e.preventDefault();
    submit({ ...form, assignee_id: form.assignee_id || null });
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
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}{u.job_title ? ` · ${u.job_title}` : ''}
                </option>
              ))}
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

          {/* A div, not a label: a label would forward clicks to the first button inside it */}
          <div className="field">
            Labels
            {visibleLabels.length === 0 ? (
              <span className="muted small">{readOnly ? 'None' : 'No labels yet'}</span>
            ) : (
              <div className="label-options">
                {visibleLabels.map((label) => {
                    const selected = form.label_ids.includes(label.id);
                    return (
                      <button
                        key={label.id}
                        type="button"
                        className={`label-option${selected ? ' selected' : ''}`}
                        style={{ '--label-color': label.color }}
                        aria-pressed={selected}
                        onClick={() => toggleLabel(label.id)}
                      >
                        <LabelChip label={label} />
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </fieldset>

      <div className="modal-footer">
        <button className="btn btn-secondary" type="button" onClick={onCancel}>
          {readOnly ? 'Close' : 'Cancel'}
        </button>
        {!readOnly && (
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : submitLabel}
          </button>
        )}
      </div>
    </form>
  );
}
