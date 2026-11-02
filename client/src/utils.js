export const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export const ticketKey = (ticket) => `BUG-${ticket.id}`;
