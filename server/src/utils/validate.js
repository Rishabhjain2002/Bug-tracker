// Request body validators shared by the controllers. Each returns the cleaned value or throws a 400.
const httpError = require('./httpError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Trimmed, non-empty text of at most `max` characters
function requireText(value, field, max) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) throw httpError(400, `${field} is required`);
  if (text.length > max) throw httpError(400, `${field} must be at most ${max} characters`);
  return text;
}

// Like requireText, but empty or missing becomes null
function optionalText(value, field, max = Infinity) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') throw httpError(400, `${field} must be text`);
  const text = value.trim();
  if (text.length > max) throw httpError(400, `${field} must be at most ${max} characters`);
  return text || null;
}

function requireOneOf(value, field, allowed) {
  if (!allowed.includes(value)) throw httpError(400, `${field} must be one of: ${allowed.join(', ')}`);
  return value;
}

// Lower-cased, so the same address cannot register twice with different casing
function requireEmail(value) {
  const email = requireText(value, 'Email', 255).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw httpError(400, 'Email is not valid');
  return email;
}

function requirePassword(value) {
  if (typeof value !== 'string' || value.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  return value;
}

// A #rrggbb hex colour, lower-cased; empty or missing becomes null
function optionalColor(value) {
  if (!value) return null;
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw httpError(400, 'Color must be a hex value like #0c66e4');
  return value.toLowerCase();
}

module.exports = { requireText, optionalText, requireOneOf, requireEmail, requirePassword, optionalColor };
