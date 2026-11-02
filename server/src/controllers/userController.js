const bcrypt = require('bcryptjs');
const { pool } = require('../db');
const httpError = require('../utils/httpError');
const {
  requireText,
  optionalText,
  requireOneOf,
  requireEmail,
  requirePassword,
  optionalColor,
} = require('../utils/validate');

const ROLES = ['admin', 'member'];
const USER_FIELDS = 'id, name, email, role, color, job_title, created_at';

// Users are listed with how many unfinished tickets are assigned to them
const USER_QUERY = `
  SELECT u.id, u.name, u.email, u.role, u.color, u.job_title, u.created_at,
    COUNT(t.id) FILTER (WHERE t.status IN ('open', 'in_progress'))::int AS open_tickets
  FROM users u
  LEFT JOIN tickets t ON t.assignee_id = u.id`;

// GET /api/users
async function listUsers(req, res) {
  const { rows } = await pool.query(`${USER_QUERY} GROUP BY u.id ORDER BY u.name`);
  res.json(rows);
}

// GET /api/users/:id
async function getUser(req, res) {
  const { rows } = await pool.query(`${USER_QUERY} WHERE u.id = $1 GROUP BY u.id`, [req.params.id]);
  if (!rows[0]) throw httpError(404, 'User not found');
  res.json(rows[0]);
}

// POST /api/users (admin) - adds a team member who can then log in with this password
async function createUser(req, res) {
  const { name, email, password, role = 'member', color, job_title } = req.body;
  const values = [
    requireText(name, 'Name', 100),
    requireEmail(email),
    await bcrypt.hash(requirePassword(password), 10),
    requireOneOf(role, 'Role', ROLES),
    optionalColor(color),
    optionalText(job_title, 'Job title', 100),
  ];

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, color, job_title)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${USER_FIELDS}`,
    values
  );
  res.status(201).json({ ...rows[0], open_tickets: 0 });
}

// PATCH /api/users/:id (admin) - partial update: fields left out keep their current value
async function updateUser(req, res) {
  const { name, role, color, job_title } = req.body;
  if (role !== undefined) requireOneOf(role, 'Role', ROLES);
  if (role !== undefined && Number(req.params.id) === req.user.id) throw httpError(400, 'You cannot change your own role');

  const { rowCount } = await pool.query(
    `UPDATE users SET name = COALESCE($1, name), role = COALESCE($2, role), color = COALESCE($3, color),
       job_title = CASE WHEN $4::boolean THEN $5 ELSE job_title END
     WHERE id = $6`,
    [
      name === undefined ? null : requireText(name, 'Name', 100),
      role ?? null,
      optionalColor(color),
      job_title !== undefined,
      optionalText(job_title, 'Job title', 100),
      req.params.id,
    ]
  );
  if (!rowCount) throw httpError(404, 'User not found');
  await getUser(req, res);
}

// DELETE /api/users/:id (admin)
async function deleteUser(req, res) {
  if (Number(req.params.id) === req.user.id) throw httpError(400, 'You cannot delete your own account');

  const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  if (!rowCount) throw httpError(404, 'User not found');
  res.status(204).end();
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
