const rateLimit = require('express-rate-limit');

// Rate limit estricto para login (fuerza bruta): 10 intentos por 15 min por IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Reintente en 15 minutos.' },
});

// Rate limit general de la API: 300 req/min por IP.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intente más tarde' },
});

module.exports = { loginLimiter, apiLimiter };
