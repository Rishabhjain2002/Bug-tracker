import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { COLORS } from '../constants';
import ColorPicker from '../components/ColorPicker';
import ConfirmDialog from '../components/ConfirmDialog';
import LabelChip from '../components/LabelChip';
import Modal from '../components/Modal';

// Create / edit form shown in a modal (admin only)
function LabelModal({ label, onClose, onSaved }) {
  const [form, setForm] = useState({ name: label?.name || '', color: label?.color || COLORS[0].value });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (label) await api.put(`/labels/${label.id}`, form);
      else await api.post('/labels', form);
      onSaved(label ? 'Label updated' : 'Label created');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Modal title={label ? 'Edit label' : 'Create label'} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <div className="label-preview">
          <LabelChip label={{ name: form.name || 'Label preview', color: form.color }} />
        </div>
        <label className="field">
          Name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={50}
            autoFocus
          />
        </label>
        <div className="field">
          Color
          <ColorPicker value={form.color} onChange={(color) => setForm({ ...form, color })} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn" type="submit">{label ? 'Save changes' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Labels() {
  const { user } = useAuth();
  const showToast = useToast();
  const isAdmin = user.role === 'admin';
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  // null = closed, { label: null } = create, { label } = edit
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadLabels = useCallback(() => {
    api
      .get('/labels')
      .then((res) => setLabels(res.data))
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  useEffect(() => {
    loadLabels();
  }, [loadLabels]);

  const handleSaved = (message) => {
    showToast(message);
    setEditing(null);
    loadLabels();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/labels/${deleting.id}`);
      showToast(`Label "${deleting.name}" deleted`);
      loadLabels();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
    setDeleting(null);
  };

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Labels</h1>
          <p className="muted">Tag tickets by type or area, then filter the board by label</p>
        </div>
        {isAdmin && (
          <button className="btn" onClick={() => setEditing({ label: null })}>
            <Plus size={16} /> Create label
          </button>
        )}
      </div>

      {!loading && labels.length === 0 ? (
        <div className="empty-state">
          <Tags size={40} />
          <h3>No labels yet</h3>
          <p className="muted">{isAdmin ? 'Create a label such as Bug or Feature.' : 'Ask an admin to create one.'}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Tickets</th>
                {isAdmin && <th></th>}
              </tr>
            </thead>
            <tbody>
              {labels.map((label) => (
                <tr key={label.id}>
                  <td data-label="Label"><LabelChip label={label} /></td>
                  <td data-label="Tickets">{label.ticket_count}</td>
                  {isAdmin && (
                    <td className="row-actions">
                      <button className="icon-btn" title="Edit label" onClick={() => setEditing({ label })}>
                        <Pencil size={16} />
                      </button>
                      <button className="icon-btn" title="Delete label" onClick={() => setDeleting(label)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <LabelModal label={editing.label} onClose={() => setEditing(null)} onSaved={handleSaved} />}
      {deleting && (
        <ConfirmDialog
          title="Delete label?"
          message={`"${deleting.name}" will be removed from its ${deleting.ticket_count} ticket(s). The tickets stay.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
