const { query } = require('../config/database');

const ALLOWED = [
  'empleado_id', 'tipo_registro', 'fecha_registro',
  'fecha_inicio', 'fecha_fin', 'fecha_reintegro',
  'diagnostico', 'observaciones', 'ruta_adjunto',
  'medico_responsable',
];

const Examen = {
  findAll: () =>
    query(
      `SELECT ex.*, e.nombre_completo, e.cedula,
              d.nombre AS departamento
       FROM examenes_medicos_reposos ex
       JOIN empleados e ON ex.empleado_id = e.id
       LEFT JOIN departamentos d
         ON e.departamento_id = d.id
       ORDER BY ex.fecha_registro DESC`
    ),

  findByEmpleado: (empleadoId) =>
    query(
      `SELECT * FROM examenes_medicos_reposos
       WHERE empleado_id = $1
       ORDER BY fecha_registro DESC`,
      [empleadoId]
    ),

  findById: (id) =>
    query(
      'SELECT * FROM examenes_medicos_reposos WHERE id = $1',
      [id]
    ),

  create: (data) => {
    const cols = ALLOWED.filter((k) => data[k] !== undefined);
    const vals = cols.map((k) => data[k]);
    const nums = cols.map((_, i) => `$${i + 1}`);
    return query(
      `INSERT INTO examenes_medicos_reposos (${cols.join(',')})
       VALUES (${nums.join(',')}) RETURNING *`,
      vals
    );
  },

  findRepososActivos: () =>
    query(
      `SELECT ex.*, e.nombre_completo, e.cedula,
              d.nombre AS departamento
       FROM examenes_medicos_reposos ex
       JOIN empleados e ON ex.empleado_id = e.id
       LEFT JOIN departamentos d
         ON e.departamento_id = d.id
       WHERE ex.tipo_registro = 'Reposo Médico'
         AND ex.fecha_reintegro IS NULL
       ORDER BY ex.fecha_inicio DESC`
    ),
};

module.exports = Examen;
