import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api, { getErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { STATUSES, statusLabel } from '../constants';
import useFetch from '../hooks/useFetch';
import { canEditTicket } from '../permissions';
import { ticketKey } from '../utils';
import BoardColumn from '../components/BoardColumn';
import PageHeader from '../components/PageHeader';
import TicketFilters from '../components/TicketFilters';
import TicketModal from '../components/TicketModal';

const EMPTY_FILTERS = { search: '', project_id: '', priority: '', assignee_id: '', label_id: '' };

export default function Board() {
  const { user } = useAuth();
  const showToast = useToast();
  const [tickets, setTickets] = useState([]);
  // Options for the filters and the ticket form
  const { data: projects } = useFetch('/projects');
  const { data: users } = useFetch('/users');
  const { data: labels } = useFetch('/labels');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  // null = closed, { ticket } = open a ticket, { status } = create a ticket in that column
  const [modal, setModal] = useState(null);

  // Refetch tickets when filters change; the delay avoids a request on every keystroke
  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
    const timer = setTimeout(() => {
      api
        .get('/tickets', { params })
        .then((res) => setTickets(res.data))
        .catch((err) => showToast(getErrorMessage(err), 'error'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, showToast]);

  // Moves the card right away, then saves; puts it back if the API rejects the change
  const handleDropTicket = async (ticketId, status) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === status) return;

    const previousTickets = tickets;
    setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, status } : t)));

    try {
      const { title, description, project_id, assignee_id, priority } = ticket;
      await api.put(`/tickets/${ticketId}`, { title, description, project_id, assignee_id, priority, status });
      showToast(`${ticketKey(ticket)} moved to ${statusLabel(status)}`);
    } catch (err) {
      setTickets(previousTickets);
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleSaved = (saved) => {
    setTickets((current) =>
      current.some((t) => t.id === saved.id) ? current.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...current]
    );
    setModal(null);
  };

  const handleDeleted = (id) => {
    setTickets((current) => current.filter((t) => t.id !== id));
    setModal(null);
  };

  const selectedProject = projects.find((p) => String(p.id) === String(filters.project_id));

  return (
    <section>
      <PageHeader
        title="Board"
        breadcrumb={`Projects / ${selectedProject?.name || 'All projects'}`}
        action={
          <button className="btn" onClick={() => setModal({ status: 'open' })}>
            <Plus size={16} /> Create
          </button>
        }
      />

      <TicketFilters
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
        projects={projects}
        users={users}
        labels={labels}
      />

      <div className="board">
        {STATUSES.map(({ value, label }) => (
          <BoardColumn
            key={value}
            status={value}
            label={label}
            tickets={tickets.filter((t) => t.status === value)}
            loading={loading}
            canDrag={(ticket) => canEditTicket(user, ticket)}
            onDropTicket={handleDropTicket}
            onOpenTicket={(ticket) => setModal({ ticket })}
            onCreate={(status) => setModal({ status })}
          />
        ))}
      </div>

      {modal && (
        <TicketModal
          ticket={modal.ticket || null}
          defaultStatus={modal.status}
          projects={projects}
          users={users}
          labels={labels}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </section>
  );
}
