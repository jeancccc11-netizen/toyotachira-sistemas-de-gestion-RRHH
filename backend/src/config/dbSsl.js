/**
 * Convierte la conexión del pool a SSL si la URL/base lo requiere (Supabase, Render, etc.).
 * En desarrollo local (DB_HOST=localhost/127.0.0.1) no se aplica SSL.
 */
const host = process.env.DB_HOST || '';
const isLocal = /^(localhost|127\.0\.0\.1|::1|postgres|db)$/.test(host);

module.exports = isLocal ? false : { rejectUnauthorized: false };
