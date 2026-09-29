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

  update: (id, { username, rol, empleadoId, activo }) => {
    const fields = [];
    const params = [];
    let i = 1;
    if (username !== undefined) { fields.push(`username = $${i++}`); params.push(username); }
    if (rol !== undefined) { fields.push(`rol = $${i++}`); params.push(rol); }
    if (empleadoId !== undefined) { fields.push(`empleado_id = $${i++}`); params.push(empleadoId); }
    if (activo !== undefined) { fields.push(`activo = $${i++}`); params.push(activo); }
    if (!fields.length) return query('SELECT id, username, rol FROM usuarios WHERE id = $1', [id]);
    params.push(id);
    return query(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id = $${i}
       RETURNING id, username, rol, empleado_id, activo`,
      params
    );
  },

  updatePassword: (id, passwordHash) =>
    query(
      'UPDATE usuarios SET password_hash = $2 WHERE id = $1 RETURNING id, username',
      [id, passwordHash]
    ),

  remove: (id) =>
    query('DELETE FROM usuarios WHERE id = $1 RETURNING id, username', [id]),
};

module.exports = Usuario;
