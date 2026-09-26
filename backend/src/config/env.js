const path = require('path');
require('dotenv').config({ override: true });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

// En producción NO se acepta un secreto por defecto: si falta JWT_SECRET se
// aborta el arranque para evitar tokens forjables.
const jwtSecret = process.env.JWT_SECRET;
if (isProd && (!jwtSecret || jwtSecret === 'dev-secret-change-me')) {
  console.error('[ENV] ❌ JWT_SECRET es obligatorio en producción. Define una cadena aleatoria de 32+ caracteres.');
  process.exit(1);
}

module.exports = {
  nodeEnv,
  isProd,
  port: parseInt(process.env.PORT || '3001'),
  jwtSecret: jwtSecret || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  // Orígenes permitidos para CORS (separados por coma). Vacío = mismo origen / sin restricción en dev.
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};
