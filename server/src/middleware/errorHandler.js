// PostgreSQL error codes mapped to client errors
const PG_ERRORS = {
  23505: { status: 409, message: 'Email is already registered' }, // unique_violation
  23503: { status: 400, message: 'Referenced project or user does not exist' }, // foreign_key_violation
  '22P02': { status: 400, message: 'Invalid id or value format' }, // invalid_text_representation
};

function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

// Express recognises an error handler by its four arguments, so `next` must stay
function errorHandler(err, req, res, next) {
  const pgError = PG_ERRORS[err.code];
  if (pgError) {
    return res.status(pgError.status).json({ message: pgError.message });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);

  res.status(status).json({ message: status === 500 ? 'Internal server error' : err.message });
}

module.exports = { notFound, errorHandler };
