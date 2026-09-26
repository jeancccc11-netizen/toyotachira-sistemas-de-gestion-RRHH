const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { loginLimiter, apiLimiter } = require('./middleware/rateLimiters');
const path = require('path');
const env = require('./config/env');
const { query, shutdown } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const uploadsAuth = require('./middleware/uploadsAuth');

const app = express();

app.set('trust proxy', 1);

// Seguridad HTTP
app.use(
  helmet({
    crossoriginResourcePolicy: { policy: 'same-site' },
  })
);

// CORS: lista blanca opcional vía CORS_ORIGINS. Sin lista, en dev se permite todo;
// en producción se recomienda siempre definirla.
app.use(
  cors(
    env.corsOrigins.length
      ? {
          origin(origin, cb) {
            if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
            cb(new Error('Origen no permitido por CORS'));
          },
        }
      : {}
  )
);

// Logging HTTP (se silencia en tests)
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.isProd ? 'combined' : 'dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limit general de la API
app.use('/api', apiLimiter);

// Archivos subidos: SOLO con token válido
app.use('/uploads', uploadsAuth(env));

// API routes
app.use('/api', routes);

// Global error handler (must be last)
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n[SI-GHR] ${signal} received. Shutting down...`);
  await shutdown();
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
const start = async () => {
  try {
    await query('SELECT NOW()');
    console.log('[SI-GHR] ✅ Database connected');

    app.listen(env.port, () => {
      console.log(`[SI-GHR] 🚀 Server running on http://localhost:${env.port}`);
      console.log(`[SI-GHR] 📡 API: http://localhost:${env.port}/api`);
      console.log(`[SI-GHR] 🌍 Environment: ${env.nodeEnv}`);
    });
  } catch (err) {
    console.error('[SI-GHR] ❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}

module.exports = { app, loginLimiter, start };
