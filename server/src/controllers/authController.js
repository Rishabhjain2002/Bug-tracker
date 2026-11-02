const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const httpError = require('../utils/httpError');
const { requireText, requireEmail, requirePassword } = require('../utils/validate');

const signToken = (user) => jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

// POST /api/auth/register
async function register(req, res) {
  const name = requireText(req.body.name, 'Name', 100);
  const email = requireEmail(req.body.email);
  const passwordHash = await bcrypt.hash(requirePassword(req.body.password), 10);

  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, color, job_title',
    [name, email, passwordHash]
  );

  res.status(201).json({ token: signToken(rows[0]), user: rows[0] });
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw httpError(401, 'Invalid email or password');
  }

  res.json({
    token: signToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role, color: user.color, job_title: user.job_title },
  });
}

// GET /api/auth/me
function getMe(req, res) {
  res.json(req.user);
}

module.exports = { register, login, getMe };
