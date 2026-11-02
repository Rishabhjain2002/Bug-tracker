// Same rules the API enforces in ticketController
const isAdmin = (user) => user.role === 'admin';

export const canEditTicket = (user, ticket) =>
  isAdmin(user) || [ticket.reporter_id, ticket.assignee_id].includes(user.id);

export const canDeleteTicket = (user, ticket) => isAdmin(user) || ticket.reporter_id === user.id;
