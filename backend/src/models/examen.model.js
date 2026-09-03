const { query } = require('../config/database');

const Examen = {
  findByEmpleado: (empleadoId) =>
    query(
      `SELECT * FROM examenes_medicos_reposos
       WHERE empleado_id = $1 ORDER BY fecha_registro DESC`,
      [empleadoId]
    ),

  findById: (id) =>
    query('SELECT * FROM examenes_medicos_reposos WHERE id = $1', [id]),

  create: (data) =>
    query(
      `INSERT INTO examenes_medicos_reposos
        (empleado_id, tipo_registro, fecha_registro, fecha_inicio, fecha_fin,
         fecha_reintegro, diagnostico, observaciones, ruta_adjunto, medico_responsable)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [data.empleado_id, data.tipo_registro, data.fecha_registro || new Date(),
       data.fecha_inicio, data.fecha_fin, data.fecha_reintegro,
       data.diagnostico, data.observaciones, data.ruta_adjunto, data.medico_responsable]
    ),

  findRepososActivos: () =>
    query(
      `SELECT ex.*, e.nombre_completo, e.cedula, d.nombre AS departamento
       FROM examenes_medicos_reposos ex
       JOIN empleados e ON ex.empleado_id = e.id
       JOIN departamentos d ON e.departamento_id = d.id
       WHERE ex.tipo_registro = 'Reposo Médico'
         AND ex.fecha_reintegro IS NULL
       ORDER BY ex.fecha_inicio DESC`
    ),
};

module.exports = Examen;
