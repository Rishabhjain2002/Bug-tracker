// Coloured label for a ticket priority, ticket status or user role
export default function Badge({ value }) {
  return <span className={`badge badge-${value}`}>{value.replace('_', ' ')}</span>;
}
