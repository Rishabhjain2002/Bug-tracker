import { useState } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useFetch from '../hooks/useFetch';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LabelChip from '../components/LabelChip';
import LabelModal from '../components/LabelModal';
import PageHeader from '../components/PageHeader';

export default function Labels() {
  const { user } = useAuth();
  const showToast = useToast();
  const isAdmin = user.role === 'admin';
  const { data: labels, loading, reload } = useFetch('/labels');
  // null = closed, { label: null } = create, { label } = edit
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleSaved = (message) => {
    showToast(message);
    setEditing(null);
    reload();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/labels/${deleting.id}`);
      showToast(`Label "${deleting.name}" deleted`);
      reload();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
    setDeleting(null);
  };

  return (
    <section>
      <PageHeader
        title="Labels"
        subtitle="Tag tickets by type or area, then filter the board by label"
        action={
          isAdmin && (
            <button className="btn" onClick={() => setEditing({ label: null })}>
              <Plus size={16} /> Create label
            </button>
          )
        }
      />

      {!loading && labels.length === 0 ? (
        <EmptyState
          icon={<Tags size={40} />}
          title="No labels yet"
          message={isAdmin ? 'Create a label such as Bug or Feature.' : 'Ask an admin to create one.'}
        />
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
