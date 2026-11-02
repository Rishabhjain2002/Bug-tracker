import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { canDeleteTicket, canEditTicket } from '../permissions';
import TicketForm from '../components/TicketForm';

const EMPTY_TICKET = {
  title: '',
  description: '',
  project_id: '',
  assignee_id: '',
  priority: 'medium',
  status: 'open',
};

// Converts an API ticket into form values (inputs cannot hold null)
const toFormValues = (ticket) => ({
  title: ticket.title,
  description: ticket.description || '',
  project_id: ticket.project_id,
  assignee_id: ticket.assignee_id || '',
  priority: ticket.priority,
  status: ticket.status,
});

// Handles both /tickets/new and /tickets/:id (edit, or read-only view without permission)
export default function TicketFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const requests = [api.get('/projects'), api.get('/users')];
    if (id) requests.push(api.get(`/tickets/${id}`));

    Promise.all(requests)
      .then(([projectsRes, usersRes, ticketRes]) => {
        setProjects(projectsRes.data);
        setUsers(usersRes.data);
        if (ticketRes) setTicket(ticketRes.data);
        setLoaded(true);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  const canEdit = !ticket || canEditTicket(user, ticket);

  const handleSubmit = async (values) => {
    if (id) await api.put(`/tickets/${id}`, values);
    else await api.post('/tickets', values);
    navigate('/');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ticket "${ticket.title}"?`)) return;
    try {
      await api.delete(`/tickets/${id}`);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section className="narrow">
      <Link className="muted" to="/">← Back to board</Link>
      <div className="page-header">
        <h1>{ticket ? `BUG-${ticket.id}` : 'Create Ticket'}</h1>
        {ticket && canDeleteTicket(user, ticket) && (
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        )}
      </div>

      {ticket && (
        <p className="muted small">
          Reported by {ticket.reporter_name || 'deleted user'}
          {!canEdit && ' · Only an admin, the reporter or the assignee can edit this ticket'}
        </p>
      )}
      {error && <p className="error">{error}</p>}

      {loaded && (
        <TicketForm
          initialValues={ticket ? toFormValues(ticket) : EMPTY_TICKET}
          projects={projects}
          users={users}
          onSubmit={handleSubmit}
          submitLabel={id ? 'Save changes' : 'Create ticket'}
          readOnly={!canEdit}
        />
      )}
    </section>
  );
}
