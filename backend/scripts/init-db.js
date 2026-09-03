/**
 * Script para inicializar la base de datos en Supabase.
 * Ejecutar: node scripts/init-db.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const { pool } = require('../src/config/database');

const SCHEMA_PATH = require('path').resolve(__dirname, '../../database/supabase_init.sql');

async function initDB() {
  console.log('[DB] Connecting to Supabase...');
  const client = await pool.connect();

  try {
    // Strip comments and send the full SQL as one query
    let sql = fs.readFileSync(SCHEMA_PATH, 'utf-8');

    // Remove single-line comments but keep $$ blocks intact
    sql = sql.replace(/^--.*$/gm, '');

    console.log('[DB] Executing full schema SQL...');

    const result = await client.query(sql);

    // Show last result if any
    if (result.rows && result.rows.length > 0) {
      console.log('[DB]', result.rows[0].resultado || JSON.stringify(result.rows[0]));
    } else {
      console.log('[DB] ✅ Schema initialized successfully on Supabase!');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

initDB().catch(err => {
  console.error('[DB] ❌ Fatal error:', err.message);
  process.exit(1);
});
