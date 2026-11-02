import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import TicketFilters from '../components/TicketFilters';
import Badge from '../components/Badge';

const EMPTY_FILTERS = { search: '', project_id: '', status: '', priority: '', assignee_id: '' };

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [error, setError] = useState('');

  // Options for the filter dropdowns
  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/users')])
      .then(([projectsRes, usersRes]) => {
        setProjects(projectsRes.data);
        setUsers(usersRes.data);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  // Refetch tickets when filters change; the delay avoids a request on every keystroke
  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    const timer = setTimeout(() => {
      api
        .get('/tickets', { params })
        .then((res) => setTickets(res.data))
        .catch((err) => setError(getErrorMessage(err)));
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const isAdmin = user.role === 'admin';
  const canEdit = (ticket) => isAdmin || [ticket.reporter_id, ticket.assignee_id].includes(user.id);
  const canDelete = (ticket) => isAdmin || ticket.reporter_id === user.id;

  const handleDelete = async (ticket) => {
    if (!window.confirm(`Delete ticket "${ticket.title}"?`)) return;
    try {
      await api.delete(`/tickets/${ticket.id}`);
      setTickets(tickets.filter((t) => t.id !== ticket.id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section>
      <div className="page-header">
        <h1>Tickets</h1>
        <Link className="btn" to="/tickets/new">+ New Ticket</Link>
      </div>

      <TicketFilters filters={filters} onChange={setFilters} projects={projects} users={users} />
      {error && <p className="error">{error}</p>}

      {tickets.length === 0 ? (
        <p className="muted">No tickets found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Project</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Reporter</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td data-label="Title">
                  <strong>{ticket.title}</strong>
                  {ticket.description && <div className="muted small">{ticket.description}</div>}
                </td>
                <td data-label="Project">{ticket.project_name}</td>
                <td data-label="Priority"><Badge value={ticket.priority} /></td>
                <td data-label="Status"><Badge value={ticket.status} /></td>
                <td data-label="Assignee">{ticket.assignee_name || 'Unassigned'}</td>
                <td data-label="Reporter">{ticket.reporter_name || '-'}</td>
                <td className="actions">
                  {canEdit(ticket) && (
                    <Link className="btn btn-secondary" to={`/tickets/${ticket.id}/edit`}>Edit</Link>
                  )}
                  {canDelete(ticket) && (
                    <button className="btn btn-danger" onClick={() => handleDelete(ticket)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
