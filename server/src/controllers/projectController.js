const { pool } = require('../db');
const httpError = require('../utils/httpError');

// GET /api/projects - each project includes how many tickets it has
async function listProjects(req, res) {
  const { rows } = await pool.query(
    `SELECT p.*, COUNT(t.id)::int AS ticket_count
     FROM projects p
     LEFT JOIN tickets t ON t.project_id = p.id
     GROUP BY p.id
     ORDER BY p.created_at DESC`
  );
  res.json(rows);
}

// GET /api/projects/:id
async function getProject(req, res) {
  const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
  if (!rows[0]) throw httpError(404, 'Project not found');
  res.json(rows[0]);
}

// POST /api/projects (admin)
async function createProject(req, res) {
  const { name, description } = req.body;
  if (!name?.trim()) throw httpError(400, 'Project name is required');

  const { rows } = await pool.query(
    'INSERT INTO projects (name, description, created_by) VALUES ($1, $2, $3) RETURNING *',
    [name.trim(), description || null, req.user.id]
  );
  res.status(201).json(rows[0]);
}

// PUT /api/projects/:id (admin)
async function updateProject(req, res) {
  const { name, description } = req.body;
  if (!name?.trim()) throw httpError(400, 'Project name is required');

  const { rows } = await pool.query(
    'UPDATE projects SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name.trim(), description || null, req.params.id]
  );
  if (!rows[0]) throw httpError(404, 'Project not found');
  res.json(rows[0]);
}

// DELETE /api/projects/:id (admin) - its tickets are removed by ON DELETE CASCADE
async function deleteProject(req, res) {
  const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
  if (!rowCount) throw httpError(404, 'Project not found');
  res.status(204).end();
}

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject };
