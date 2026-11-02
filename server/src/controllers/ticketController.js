const { pool } = require('../db');
const httpError = require('../utils/httpError');

const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const PRIORITIES = ['low', 'medium', 'high'];

// Tickets are always returned with their project, assignee and reporter names
const TICKET_QUERY = `
  SELECT t.*, p.name AS project_name, a.name AS assignee_name, r.name AS reporter_name
  FROM tickets t
  JOIN projects p ON p.id = t.project_id
  LEFT JOIN users a ON a.id = t.assignee_id
  LEFT JOIN users r ON r.id = t.reporter_id`;

async function findTicket(id) {
  const { rows } = await pool.query(`${TICKET_QUERY} WHERE t.id = $1`, [id]);
  if (!rows[0]) throw httpError(404, 'Ticket not found');
  return rows[0];
}

// Validates the request body and returns the values to save
function parseTicketBody(body) {
  const { title, description, status = 'open', priority = 'medium', project_id, assignee_id } = body;

  if (!title?.trim()) throw httpError(400, 'Title is required');
  if (!project_id) throw httpError(400, 'Project is required');
  if (!STATUSES.includes(status)) throw httpError(400, `Status must be one of: ${STATUSES.join(', ')}`);
  if (!PRIORITIES.includes(priority)) throw httpError(400, `Priority must be one of: ${PRIORITIES.join(', ')}`);

  return [title.trim(), description || null, status, priority, project_id, assignee_id || null];
}

const isAdmin = (user) => user.role === 'admin';

// GET /api/tickets?search=&status=&priority=&project_id=&assignee_id=
async function listTickets(req, res) {
  const { search, status, priority, project_id, assignee_id } = req.query;
  const conditions = [];
  const values = [];

  // Adds a value to the query parameters and returns its placeholder ($1, $2, ...)
  const param = (value) => {
    values.push(value);
    return `$${values.length}`;
  };

  if (search) {
    const placeholder = param(`%${search}%`);
    conditions.push(`(t.title ILIKE ${placeholder} OR t.description ILIKE ${placeholder})`);
  }
  if (status) conditions.push(`t.status = ${param(status)}`);
  if (priority) conditions.push(`t.priority = ${param(priority)}`);
  if (project_id) conditions.push(`t.project_id = ${param(project_id)}`);
  if (assignee_id) conditions.push(`t.assignee_id = ${param(assignee_id)}`);

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(`${TICKET_QUERY} ${where} ORDER BY t.updated_at DESC`, values);
  res.json(rows);
}

// GET /api/tickets/:id
async function getTicket(req, res) {
  res.json(await findTicket(req.params.id));
}

// POST /api/tickets
async function createTicket(req, res) {
  const values = parseTicketBody(req.body);

  const { rows } = await pool.query(
    `INSERT INTO tickets (title, description, status, priority, project_id, assignee_id, reporter_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [...values, req.user.id]
  );
  res.status(201).json(await findTicket(rows[0].id));
}

// PUT /api/tickets/:id - admin, reporter or assignee
async function updateTicket(req, res) {
  const ticket = await findTicket(req.params.id);
  const canEdit = isAdmin(req.user) || [ticket.reporter_id, ticket.assignee_id].includes(req.user.id);
  if (!canEdit) throw httpError(403, 'Only an admin, the reporter or the assignee can edit this ticket');

  const values = parseTicketBody(req.body);
  await pool.query(
    `UPDATE tickets
     SET title = $1, description = $2, status = $3, priority = $4, project_id = $5, assignee_id = $6, updated_at = NOW()
     WHERE id = $7`,
    [...values, ticket.id]
  );
  res.json(await findTicket(ticket.id));
}

// DELETE /api/tickets/:id - admin or reporter
async function deleteTicket(req, res) {
  const ticket = await findTicket(req.params.id);
  if (!isAdmin(req.user) && ticket.reporter_id !== req.user.id) {
    throw httpError(403, 'Only an admin or the reporter can delete this ticket');
  }

  await pool.query('DELETE FROM tickets WHERE id = $1', [ticket.id]);
  res.status(204).end();
}

module.exports = { listTickets, getTicket, createTicket, updateTicket, deleteTicket };
