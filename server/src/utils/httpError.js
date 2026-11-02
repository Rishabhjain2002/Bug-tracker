// Creates an Error carrying an HTTP status code for the error handler
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = httpError;
