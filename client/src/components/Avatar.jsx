const COLORS = ['#0c66e4', '#1f845a', '#e2483d', '#6e5dc6', '#d97008', '#1d7f8c'];

// Round initials badge for a user; shows "?" when nobody is assigned
export default function Avatar({ id, name, size = 'md' }) {
  if (!name) {
    return <span className={`avatar avatar-${size} avatar-empty`} title="Unassigned">?</span>;
  }

  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className={`avatar avatar-${size}`} style={{ background: COLORS[id % COLORS.length] }} title={name}>
      {initials}
    </span>
  );
}
