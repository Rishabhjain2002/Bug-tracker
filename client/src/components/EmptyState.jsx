// Placeholder shown when a list has nothing in it yet; `icon` is a rendered icon element
export default function EmptyState({ icon, title, message }) {
  return (
    <div className="empty-state">
      {icon}
      <h3>{title}</h3>
      <p className="muted">{message}</p>
    </div>
  );
}
