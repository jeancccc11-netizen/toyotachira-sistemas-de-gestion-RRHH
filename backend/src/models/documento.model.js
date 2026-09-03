const { query } = require('../config/database');

const Documento = {
  findByEmpleado: (empleadoId) =>
    query(
      `SELECT * FROM documentos_empleado
       WHERE empleado_id = $1 ORDER BY fecha_registro DESC`,
      [empleadoId]
    ),

  findById: (id) =>
    query('SELECT * FROM documentos_empleado WHERE id = $1', [id]),

  create: (data) =>
    query(
      `INSERT INTO documentos_empleado
        (empleado_id, tipo_documento, nombre_archivo, ruta_archivo, observaciones)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.empleado_id, data.tipo_documento, data.nombre_archivo,
       data.ruta_archivo, data.observaciones]
    ),

  delete: (id) =>
    query('DELETE FROM documentos_empleado WHERE id = $1 RETURNING *', [id]),

  countByTipo: () =>
    query(
      `SELECT tipo_documento, COUNT(*) AS total
       FROM documentos_empleado GROUP BY tipo_documento`
    ),
};

module.exports = Documento;
