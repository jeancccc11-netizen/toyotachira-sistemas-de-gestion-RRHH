const { Pool } = require('pg');

// Supabase pooler - keep connections minimal to avoid queuing
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '6543'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 5,                     // Keep low for Supabase pooler
  min: 0,                     // No idle connections kept open
  idleTimeoutMillis: 10000,   // Close idle connections quickly
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,      // Let pool exit when all clients idle
});

pool.on('error', (err) => {
  console.error('[DB] Idle client error:', err.message);
});

/**
 * Execute a query and automatically release the connection.
 */
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();   // ALWAYS release back to pool
  }
};

/**
 * Get a client for transactions. Caller MUST call client.release().
 */
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

/**
 * Gracefully close all connections on shutdown.
 */
const shutdown = async () => {
  console.log('[DB] Closing pool...');
  await pool.end();
  console.log('[DB] Pool closed.');
};

module.exports = { pool, query, getClient, shutdown };
