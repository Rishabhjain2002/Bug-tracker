const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const httpError = require('../utils/httpError');

// Verifies the JWT and loads the current user, so role changes and deletions take effect immediately
async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw httpError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Invalid or expired token');
  }

  const { rows } = await pool.query('SELECT id, name, email, role, color, job_title FROM users WHERE id = $1', [payload.id]);
  if (!rows[0]) throw httpError(401, 'User no longer exists');

  req.user = rows[0];
  next();
}

// Allows the request only if the current user has one of the given roles
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw httpError(403, 'You do not have permission to perform this action');
    }
    next();
  };
}

module.exports = { authenticate, authorize };
