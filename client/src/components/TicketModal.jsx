import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { canDeleteTicket, canEditTicket } from '../permissions';
import { formatDate, ticketKey } from '../utils';
import Modal from './Modal';
import TicketForm from './TicketForm';

// Converts an API ticket into form values (inputs cannot hold null)
const toFormValues = (ticket) => ({
  title: ticket.title,
  description: ticket.description || '',
  project_id: ticket.project_id,
  assignee_id: ticket.assignee_id || '',
  priority: ticket.priority,
  status: ticket.status,
});

// Creates a ticket when `ticket` is null, otherwise edits it (or shows it read-only)
export default function TicketModal({ ticket, defaultStatus = 'open', projects, users, onClose, onSaved, onDeleted }) {
  const { user } = useAuth();
  const showToast = useToast();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isNew = !ticket;
  const canEdit = isNew || canEditTicket(user, ticket);

  const initialValues = isNew
    ? { title: '', description: '', project_id: projects[0]?.id || '', assignee_id: '', priority: 'medium', status: defaultStatus }
    : toFormValues(ticket);

  const handleSubmit = async (values) => {
    const res = isNew ? await api.post('/tickets', values) : await api.put(`/tickets/${ticket.id}`, values);
    showToast(`${ticketKey(res.data)} ${isNew ? 'created' : 'updated'}`);
    onSaved(res.data);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tickets/${ticket.id}`);
      showToast(`${ticketKey(ticket)} deleted`);
      onDeleted(ticket.id);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
      setConfirmingDelete(false);
    }
  };

  const deleteButton = !isNew && canDeleteTicket(user, ticket) && (
    <button className="icon-btn" title="Delete ticket" onClick={() => setConfirmingDelete(true)}>
      <Trash2 size={18} />
    </button>
  );

  return (
    <Modal title={isNew ? 'Create ticket' : ticketKey(ticket)} actions={deleteButton} onClose={onClose} size="lg">
      {confirmingDelete && (
        <div className="confirm-bar">
          <span>Delete this ticket permanently?</span>
          <button className="btn btn-secondary" onClick={() => setConfirmingDelete(false)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      )}

      {!isNew && (
        <p className="ticket-info">
          Reported by {ticket.reporter_name || 'deleted user'} · Created {formatDate(ticket.created_at)} · Updated{' '}
          {formatDate(ticket.updated_at)}
          {!canEdit && <span className="view-only">View only</span>}
        </p>
      )}

      {isNew && projects.length === 0 ? (
        <p className="muted">There are no projects yet. An admin needs to create a project first.</p>
      ) : (
        <TicketForm
          initialValues={initialValues}
          projects={projects}
          users={users}
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel={isNew ? 'Create' : 'Save changes'}
          readOnly={!canEdit}
        />
      )}
    </Modal>
  );
}
