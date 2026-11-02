import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

const PRIORITY_ICONS = { high: '↑', medium: '=', low: '↓' };

export default function TicketCard({ ticket, draggable }) {
  const navigate = useNavigate();

  return (
    <div
      className={`ticket-card${draggable ? ' draggable' : ''}`}
      draggable={draggable}
      onDragStart={(e) => e.dataTransfer.setData('text/plain', ticket.id)}
      onClick={() => navigate(`/tickets/${ticket.id}`)}
    >
      <p className="ticket-title">{ticket.title}</p>
      <span className="ticket-project">{ticket.project_name}</span>
      <div className="ticket-meta">
        <span className="ticket-key">BUG-{ticket.id}</span>
        <span className={`priority priority-${ticket.priority}`} title={`${ticket.priority} priority`}>
          {PRIORITY_ICONS[ticket.priority]}
        </span>
        <Avatar id={ticket.assignee_id} name={ticket.assignee_name} />
      </div>
    </div>
  );
}
