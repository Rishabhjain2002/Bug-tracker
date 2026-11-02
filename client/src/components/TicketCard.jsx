import { useState } from 'react';
import { ticketKey } from '../utils';
import Avatar from './Avatar';
import PriorityIcon from './PriorityIcon';

export default function TicketCard({ ticket, draggable, onOpen }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', ticket.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  return (
    <div
      className={`ticket-card${draggable ? ' draggable' : ''}${isDragging ? ' dragging' : ''}`}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={() => setIsDragging(false)}
      onClick={() => onOpen(ticket)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(ticket)}
      role="button"
      tabIndex={0}
    >
      <p className="ticket-title">{ticket.title}</p>
      <span className="ticket-project">{ticket.project_name}</span>
      <div className="ticket-meta">
        <span className="ticket-key">{ticketKey(ticket)}</span>
        <PriorityIcon priority={ticket.priority} />
        <Avatar id={ticket.assignee_id} name={ticket.assignee_name} size="sm" />
      </div>
    </div>
  );
}
