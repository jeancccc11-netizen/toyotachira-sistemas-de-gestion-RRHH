/**
 * Migrador SQL versionado y sin dependencias.
 *
 * - Cada archivo .sql de database/migrations se aplica UNA vez, en orden alfabético.
 * - El estado queda registrado en la tabla `_migrations` (esquema public).
 * - Uso:  node database/migrate.js          (aplica pendientes)
 *         node database/migrate.js status   (solo lista)
 *
 * Requiere DB_HOST/DB_USER/DB_PASSWORD/DB_NAME o DATABASE_URL en backend/.env
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '6543'),
        database: process.env.DB_NAME || 'postgres',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false },
      }
);

const ensureTable = `
  CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const listFiles = () =>
  fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.toLowerCase().endsWith('.sql'))
    .sort();

const applied = async (client) => {
  const res = await client.query('SELECT name FROM _migrations');
  return new Set(res.rows.map((r) => r.name));
};

async function main() {
  const statusOnly = process.argv.includes('status');
  const client = await pool.connect();
  try {
    await client.query(ensureTable);
    const done = await applied(client);
    const files = listFiles();

    if (!files.length) {
      console.log('[migrate] No hay archivos de migración en database/migrations');
      return;
    }

    let pending = 0;
    for (const file of files) {
      if (done.has(file)) {
        console.log(`  ✔ ya aplicada   ${file}`);
        continue;
      }
      pending++;
      if (statusOnly) {
        console.log(`  ✗ pendiente      ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`▶ Aplicando ${file} ...`);
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`  ✔ OK             ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ✖ ERROR en ${file}: ${err.message}`);
        process.exitCode = 1;
        break; // detener en el primer error para aplicar en orden
      }
    }
    if (!pending) console.log('[migrate] Base de datos al día.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[migrate] ❌', err.message);
  process.exit(1);
});
