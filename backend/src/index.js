const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const { query, shutdown } = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.resolve(env.uploadDir)));

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

start();

module.exports = app;
