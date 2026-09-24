const ApiError = require('../utils/ApiError');

const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

/**
 * Tiny schema validator: { field: { required, type, min, max, email, enum, label } }
 */
const validate = (schema, source = 'body') => (req, _res, next) => {
  const data = req[source] || {};
  const errors = {};
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const label = rules.label || field;
    const empty = value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    if (rules.required && empty) { errors[field] = label + ' is required'; continue; }
    if (empty) continue;
    if (rules.type === 'number' && Number.isNaN(Number(value))) errors[field] = label + ' must be a number';
    if (rules.type === 'string' && typeof value !== 'string') errors[field] = label + ' must be text';
    if (rules.min && String(value).length < rules.min) errors[field] = label + ' must be at least ' + rules.min + ' characters';
    if (rules.max && String(value).length > rules.max) errors[field] = label + ' must be at most ' + rules.max + ' characters';
    if (rules.email && !isEmail(value)) errors[field] = 'Please enter a valid email address';
    if (rules.enum && !rules.enum.includes(value)) errors[field] = label + ' must be one of ' + rules.enum.join(', ');
  }
  if (Object.keys(errors).length) return next(ApiError.badRequest('Validation failed', errors));
  next();
};

module.exports = { validate, isEmail };
