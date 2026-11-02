const { pool } = require('../db');
const httpError = require('../utils/httpError');
const parseColor = require('../utils/color');

// Validates the request body and returns [name, color]
function parseLabelBody(body) {
  const { name, color } = body;
  if (!name?.trim()) throw httpError(400, 'Label name is required');
  if (!color) throw httpError(400, 'Label color is required');
  return [name.trim(), parseColor(color)];
}

// GET /api/labels - each label includes how many tickets use it
async function listLabels(req, res) {
  const { rows } = await pool.query(
    `SELECT l.*, COUNT(tl.ticket_id)::int AS ticket_count
     FROM labels l
     LEFT JOIN ticket_labels tl ON tl.label_id = l.id
     GROUP BY l.id
     ORDER BY l.name`
  );
  res.json(rows);
}

// POST /api/labels (admin)
async function createLabel(req, res) {
  const { rows } = await pool.query(
    'INSERT INTO labels (name, color) VALUES ($1, $2) RETURNING *',
    parseLabelBody(req.body)
  );
  res.status(201).json({ ...rows[0], ticket_count: 0 });
}

// PUT /api/labels/:id (admin)
async function updateLabel(req, res) {
  const { rows } = await pool.query(
    'UPDATE labels SET name = $1, color = $2 WHERE id = $3 RETURNING *',
    [...parseLabelBody(req.body), req.params.id]
  );
  if (!rows[0]) throw httpError(404, 'Label not found');
  res.json(rows[0]);
}

// DELETE /api/labels/:id (admin) - it is removed from its tickets by ON DELETE CASCADE
async function deleteLabel(req, res) {
  const { rowCount } = await pool.query('DELETE FROM labels WHERE id = $1', [req.params.id]);
  if (!rowCount) throw httpError(404, 'Label not found');
  res.status(204).end();
}

module.exports = { listLabels, createLabel, updateLabel, deleteLabel };
