import { PRIORITIES, STATUSES } from '../constants';

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
      <select name="status" value={filters.status} onChange={handleChange}>
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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
