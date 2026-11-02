import { useState } from 'react';
import { Plus } from 'lucide-react';
import TicketCard from './TicketCard';

// One status column of the board; tickets dropped here move to this status
export default function BoardColumn({ status, label, tickets, loading, canDrag, onDropTicket, onOpenTicket, onCreate }) {
  const [isOver, setIsOver] = useState(false);

  // preventDefault marks the column as a valid drop target
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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
        <span className={`status-dot status-${status}`} />
        {label}
        <span className="column-count">{loading ? '' : tickets.length}</span>
      </h2>

      <div className="column-cards">
        {loading && [1, 2].map((n) => <div key={n} className="skeleton-card" />)}
        {!loading && tickets.length === 0 && <div className="column-empty">No tickets</div>}
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} draggable={canDrag(ticket)} onOpen={onOpenTicket} />
        ))}
      </div>

      <button className="column-create" onClick={() => onCreate(status)}>
        <Plus size={16} /> Create
      </button>
    </div>
  );
}
