import { FilterX, Search } from 'lucide-react';
import { PRIORITIES } from '../constants';
import Avatar from './Avatar';

// Status is not a filter here because the board already groups tickets by status
export default function TicketFilters({ filters, onChange, onClear, projects, users }) {
  const setFilter = (name, value) => onChange({ ...filters, [name]: value });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="filters">
      <div className="search-box">
        <Search size={16} />
        <input
          placeholder="Search tickets"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
        />
      </div>

      {/* Click an avatar to show only that person's tickets */}
      <div className="avatar-filter">
        {users.map((u) => {
          const active = String(filters.assignee_id) === String(u.id);
          return (
            <button
              key={u.id}
              className={`avatar-toggle${active ? ' active' : ''}`}
              title={u.name}
              aria-pressed={active}
              onClick={() => setFilter('assignee_id', active ? '' : u.id)}
            >
              <Avatar id={u.id} name={u.name} />
            </button>
          );
        })}
      </div>

      <select value={filters.project_id} onChange={(e) => setFilter('project_id', e.target.value)}>
        <option value="">All projects</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>

      <select value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)}>
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>

      {hasFilters && (
        <button className="btn btn-ghost" onClick={onClear}>
          <FilterX size={16} /> Clear filters
        </button>
      )}
    </div>
  );
}
