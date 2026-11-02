const COLORS = ['#0052cc', '#00875a', '#ff5630', '#6554c0', '#ff991f', '#00a3bf'];

// Round initials badge for a user; shows "?" when nobody is assigned
export default function Avatar({ id, name }) {
  if (!name) {
    return <span className="avatar avatar-empty" title="Unassigned">?</span>;
  }

  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="avatar" style={{ background: COLORS[id % COLORS.length] }} title={name}>
      {initials}
    </span>
  );
}
