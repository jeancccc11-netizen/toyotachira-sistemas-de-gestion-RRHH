const { query } = require('../config/database');

const Usuario = {
  findByUsername: (username) =>
    query('SELECT * FROM usuarios WHERE username = $1 AND activo = true', [username]),

  findById: (id) =>
    query('SELECT id, username, rol, empleado_id, activo FROM usuarios WHERE id = $1', [id]),

  create: ({ username, passwordHash, rol, empleadoId }) =>
    query(
      `INSERT INTO usuarios (username, password_hash, rol, empleado_id)
       VALUES ($1, $2, $3, $4) RETURNING id, username, rol`,
      [username, passwordHash, rol || 'consulta', empleadoId || null]
    ),

  updateLastAccess: (id) =>
    query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = $1', [id]),

  findAll: () =>
    query('SELECT id, username, rol, activo, ultimo_acceso FROM usuarios ORDER BY username'),

  toggleActive: (id, activo) =>
    query('UPDATE usuarios SET activo = $2 WHERE id = $1 RETURNING id, activo', [id, activo]),
};

module.exports = Usuario;
