import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
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

// Handles both /tickets/new and /tickets/:id/edit
export default function TicketFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [initialValues, setInitialValues] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const requests = [api.get('/projects'), api.get('/users')];
    if (id) requests.push(api.get(`/tickets/${id}`));

    Promise.all(requests)
      .then(([projectsRes, usersRes, ticketRes]) => {
        setProjects(projectsRes.data);
        setUsers(usersRes.data);
        setInitialValues(ticketRes ? toFormValues(ticketRes.data) : EMPTY_TICKET);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [id]);

  const handleSubmit = async (values) => {
    if (id) await api.put(`/tickets/${id}`, values);
    else await api.post('/tickets', values);
    navigate('/');
  };

  return (
    <section className="narrow">
      <h1>{id ? 'Edit Ticket' : 'New Ticket'}</h1>
      {error && <p className="error">{error}</p>}
      {initialValues && (
        <TicketForm
          initialValues={initialValues}
          projects={projects}
          users={users}
          onSubmit={handleSubmit}
          submitLabel={id ? 'Save changes' : 'Create ticket'}
        />
      )}
    </section>
  );
}
