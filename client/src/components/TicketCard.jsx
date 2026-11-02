import { useState } from 'react';
import { ticketKey } from '../utils';
import Avatar from './Avatar';
import LabelChip from './LabelChip';
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
      {ticket.labels.length > 0 && (
        <div className="ticket-labels">
          {ticket.labels.map((label) => <LabelChip key={label.id} label={label} />)}
        </div>
      )}
      <span className="ticket-project">{ticket.project_name}</span>
      <div className="ticket-meta">
        <span className="ticket-key">{ticketKey(ticket)}</span>
        <PriorityIcon priority={ticket.priority} />
        <Avatar id={ticket.assignee_id} name={ticket.assignee_name} color={ticket.assignee_color} size="sm" />
      </div>
    </div>
  );
}
