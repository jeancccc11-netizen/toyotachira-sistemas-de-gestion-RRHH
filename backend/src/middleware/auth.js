const jwt = require('jsonwebtoken');
const env = require('../config/env');
const blocklist = require('../config/tokenBlocklist');

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  // Token por header (axios/fetch) o por query (?token=...) como respaldo:
  // window.open / <img> / <a> no pueden enviar headers.
  const tokenFromHeader = header && header.startsWith('Bearer ') ? header.slice(7) : '';
  const tokenFromQuery = req.method === 'GET' && typeof req.query.token === 'string' ? req.query.token : '';

  if (!tokenFromHeader && !tokenFromQuery) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  try {
    const token = tokenFromHeader || tokenFromQuery;
    const decoded = jwt.verify(token, env.jwtSecret);
    if (decoded.jti && blocklist.isRevoked(decoded.jti)) {
      return res.status(401).json({ error: 'Sesión cerrada. Inicie sesión de nuevo.' });
    }
    req.user = decoded;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

const roleMiddleware = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) {
    return res.status(403).json({ error: 'No tiene permisos para esta acción' });
  }
  next();
};

module.exports = { authMiddleware, roleMiddleware };
