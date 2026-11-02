import { colorFor } from '../constants';

// Round initials badge for a user; shows "?" when nobody is assigned
export default function Avatar({ id, name, color, size = 'md' }) {
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
    <span className={`avatar avatar-${size}`} style={{ background: colorFor({ id, color }) }} title={name}>
      {initials}
    </span>
  );
}
