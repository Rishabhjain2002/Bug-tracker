const httpError = require('./httpError');

// Accepts a #rrggbb hex colour; returns it lower-cased, or null when empty
function parseColor(value) {
  if (!value) return null;
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw httpError(400, 'Color must be a hex value like #0c66e4');
  return value.toLowerCase();
}

module.exports = parseColor;
