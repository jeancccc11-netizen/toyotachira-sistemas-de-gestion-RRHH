/**
 * Middleware factory for request body validation.
 * @param {Object} schema - { fieldName: { type, required, min, max } }
 */
const validateBody = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} es obligatorio`);
      continue;
    }

    if (value === undefined || value === null) continue;

    if (rules.type === 'number' && isNaN(Number(value))) {
      errors.push(`${field} debe ser numérico`);
    }

    if (rules.type === 'date' && isNaN(Date.parse(value))) {
      errors.push(`${field} debe ser una fecha válida`);
    }

    if (rules.min !== undefined && Number(value) < rules.min) {
      errors.push(`${field} debe ser >= ${rules.min}`);
    }

    if (rules.max !== undefined && value.length > rules.max) {
      errors.push(`${field} no debe exceder ${rules.max} caracteres`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = { validateBody };
