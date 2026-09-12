/**
 * Ejecuta la migración de la columna 'carpeta' en documentos_empleado
 * 
 * Uso:
 *   node database/run_migration.js
 * 
 * Requiere variable de entorno DATABASE_URL o datos de conexión en .env
 */

const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '6543'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const MIGRATION = `
-- Migration: Add carpeta (folder) column to documentos_empleado
ALTER TABLE documentos_empleado
ADD COLUMN IF NOT EXISTS carpeta VARCHAR(100);

COMMENT ON COLUMN documentos_empleado.carpeta IS
  'Carpeta virtual para organizar documentos del expediente';

-- Index for folder queries
CREATE INDEX IF NOT EXISTS idx_docs_carpeta
ON documentos_empleado(carpeta)
WHERE carpeta IS NOT NULL;
`;

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔌 Conectando a Supabase...');
    await client.query('SELECT 1');
    console.log('✅ Conexión exitosa');

    console.log('📝 Ejecutando migración...');
    await client.query(MIGRATION);
    console.log('✅ Migración ejecutada: columna "carpeta" agregada');

    // Verify
    const res = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'documentos_empleado' AND column_name = 'carpeta'
    `);
    if (res.rows.length) {
      console.log('✅ Verificado: columna "carpeta" existe en documentos_empleado');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Conexión cerrada');
  }
}

run();
