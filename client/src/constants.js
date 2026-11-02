export const STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const statusLabel = (value) => STATUSES.find((s) => s.value === value)?.label;

// Colours for team members and labels; all are dark enough for white text
export const COLORS = [
  { value: '#0c66e4', name: 'Blue' },
  { value: '#1f845a', name: 'Green' },
  { value: '#c9372c', name: 'Red' },
  { value: '#6e5dc6', name: 'Purple' },
  { value: '#d97008', name: 'Orange' },
  { value: '#1d7f8c', name: 'Teal' },
  { value: '#ae4787', name: 'Magenta' },
  { value: '#946f00', name: 'Gold' },
  { value: '#44546f', name: 'Slate' },
];

// Fallback for users who have not picked a colour (e.g. self-registered)
export const colorFor = (user) => user.color || COLORS[user.id % COLORS.length].value;
