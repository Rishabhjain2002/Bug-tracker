import { PRIORITIES } from '../constants';

// Status is not a filter here because the board already groups tickets by status
export default function TicketFilters({ filters, onChange, projects, users }) {
  const handleChange = (e) => onChange({ ...filters, [e.target.name]: e.target.value });

  return (
    <div className="filters">
      <input
        name="search"
        placeholder="Search title or description..."
        value={filters.search}
        onChange={handleChange}
      />
      <select name="project_id" value={filters.project_id} onChange={handleChange}>
        <option value="">All projects</option>
        {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <select name="priority" value={filters.priority} onChange={handleChange}>
        <option value="">All priorities</option>
        {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </select>
      <select name="assignee_id" value={filters.assignee_id} onChange={handleChange}>
        <option value="">All assignees</option>
        {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
    </div>
  );
}
