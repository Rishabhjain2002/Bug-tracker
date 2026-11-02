const { pool } = require('../db');
const httpError = require('../utils/httpError');

const ROLES = ['admin', 'member'];
const USER_FIELDS = 'id, name, email, role, created_at';

// GET /api/users
async function listUsers(req, res) {
  const { rows } = await pool.query(`SELECT ${USER_FIELDS} FROM users ORDER BY name`);
  res.json(rows);
}

// GET /api/users/:id
async function getUser(req, res) {
  const { rows } = await pool.query(`SELECT ${USER_FIELDS} FROM users WHERE id = $1`, [req.params.id]);
  if (!rows[0]) throw httpError(404, 'User not found');
  res.json(rows[0]);
}

// PUT /api/users/:id (admin)
async function updateUser(req, res) {
  const { name, role } = req.body;
  if (role && !ROLES.includes(role)) throw httpError(400, `Role must be one of: ${ROLES.join(', ')}`);
  if (role && Number(req.params.id) === req.user.id) throw httpError(400, 'You cannot change your own role');

  const { rows } = await pool.query(
    `UPDATE users SET name = COALESCE($1, name), role = COALESCE($2, role)
     WHERE id = $3 RETURNING ${USER_FIELDS}`,
    [name?.trim() || null, role || null, req.params.id]
  );
  if (!rows[0]) throw httpError(404, 'User not found');
  res.json(rows[0]);
}

// DELETE /api/users/:id (admin)
async function deleteUser(req, res) {
  if (Number(req.params.id) === req.user.id) throw httpError(400, 'You cannot delete your own account');

  const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  if (!rowCount) throw httpError(404, 'User not found');
  res.status(204).end();
}

module.exports = { listUsers, getUser, updateUser, deleteUser };
