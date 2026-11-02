// PostgreSQL error codes mapped to client errors
const PG_ERRORS = {
  23505: { status: 409, message: 'A record with this value already exists' }, // unique_violation
  23503: { status: 400, message: 'Referenced project, user or label does not exist' }, // foreign_key_violation
  '22P02': { status: 400, message: 'Invalid id or value format' }, // invalid_text_representation
  22001: { status: 400, message: 'A value is longer than allowed' }, // string_data_right_truncation
};

// unique_violation messages per constraint, more specific than the generic one above
const UNIQUE_MESSAGES = {
  users_email_key: 'Email is already registered',
  labels_name_key: 'A label with this name already exists',
};

function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

// Express recognises an error handler by its four arguments, so `next` must stay
function errorHandler(err, req, res, next) {
  if (err.code === '23505' && UNIQUE_MESSAGES[err.constraint]) {
    return res.status(409).json({ message: UNIQUE_MESSAGES[err.constraint] });
  }

  const pgError = PG_ERRORS[err.code];
  if (pgError) {
    return res.status(pgError.status).json({ message: pgError.message });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);

  res.status(status).json({ message: status === 500 ? 'Internal server error' : err.message });
}

module.exports = { notFound, errorHandler };
