import { ArrowDown, ArrowUp, Equal } from 'lucide-react';

const ICONS = { high: ArrowUp, medium: Equal, low: ArrowDown };

export default function PriorityIcon({ priority }) {
  const Icon = ICONS[priority];
  return (
    <span className={`priority priority-${priority}`} title={`${priority} priority`}>
      <Icon size={16} strokeWidth={2.5} />
    </span>
  );
}
