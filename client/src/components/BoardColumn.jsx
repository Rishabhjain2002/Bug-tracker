import { useState } from 'react';
import TicketCard from './TicketCard';

// One status column of the board; tickets dropped here move to this status
export default function BoardColumn({ status, label, tickets, canDrag, onDropTicket }) {
  const [isOver, setIsOver] = useState(false);

  // preventDefault marks the column as a valid drop target
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  // Ignore leave events caused by moving over a card inside the column
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    onDropTicket(Number(e.dataTransfer.getData('text/plain')), status);
  };

  return (
    <div
      className={`board-column${isOver ? ' drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h2 className="column-title">
        {label} <span className="column-count">{tickets.length}</span>
      </h2>
      <div className="column-cards">
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} draggable={canDrag(ticket)} />
        ))}
      </div>
    </div>
  );
}
