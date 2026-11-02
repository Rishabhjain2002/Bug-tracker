import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { STATUSES } from '../constants';
import { canEditTicket } from '../permissions';
import TicketFilters from '../components/TicketFilters';
import BoardColumn from '../components/BoardColumn';

const EMPTY_FILTERS = { search: '', project_id: '', priority: '', assignee_id: '' };

export default function Board() {
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

  // Moves the card right away, then saves; puts it back if the API rejects the change
  const handleDropTicket = async (ticketId, status) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === status) return;

    const previousTickets = tickets;
    setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)));
    setError('');

    try {
      const { title, description, project_id, assignee_id, priority } = ticket;
      await api.put(`/tickets/${ticketId}`, { title, description, project_id, assignee_id, priority, status });
    } catch (err) {
      setTickets(previousTickets);
      setError(getErrorMessage(err));
    }
  };

  return (
    <section>
      <div className="page-header">
        <h1>Board</h1>
        <Link className="btn" to="/tickets/new">Create</Link>
      </div>

      <TicketFilters filters={filters} onChange={setFilters} projects={projects} users={users} />
      {error && <p className="error">{error}</p>}

      <div className="board">
        {STATUSES.map(({ value, label }) => (
          <BoardColumn
            key={value}
            status={value}
            label={label}
            tickets={tickets.filter((t) => t.status === value)}
            canDrag={(ticket) => canEditTicket(user, ticket)}
            onDropTicket={handleDropTicket}
          />
        ))}
      </div>
    </section>
  );
}
