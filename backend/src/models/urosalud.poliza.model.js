const { query } = require('../config/database');

const Poliza = {
  findAll: (filters = {}) => {
    let sql = `
      SELECT p.*, e.nombre_completo, e.cedula, d.nombre AS departamento,
             COUNT(cf.id) FILTER (WHERE cf.estado = 'Activo') AS total_cargas
      FROM polizas_urosalud p
      JOIN empleados e ON p.empleado_id = e.id
      JOIN departamentos d ON e.departamento_id = d.id
      LEFT JOIN cargas_familiares cf ON p.id = cf.poliza_id
      WHERE 1=1
    `;
    const params = [];
    let i = 1;
    if (filters.estado) { sql += ` AND p.estado = $${i++}`; params.push(filters.estado); }
    if (filters.plan) { sql += ` AND p.plan_contratado = $${i++}`; params.push(filters.plan); }
    if (filters.search) {
      sql += ` AND (e.nombre_completo ILIKE $${i} OR e.cedula ILIKE $${i} OR p.numero_poliza ILIKE $${i})`;
      params.push(`%${filters.search}%`); i++;
    }
    sql += ' GROUP BY p.id, e.id, d.id ORDER BY e.nombre_completo';
    return query(sql, params);
  },

  findById: (id) => query(
    `SELECT p.*, e.nombre_completo, e.cedula
     FROM polizas_urosalud p JOIN empleados e ON p.empleado_id = e.id
     WHERE p.id = $1`, [id]
  ),

  findByEmpleado: (empleadoId) => query(
    'SELECT * FROM polizas_urosalud WHERE empleado_id = $1 ORDER BY fecha_afiliacion DESC',
    [empleadoId]
  ),

  create: (data) => query(
    `INSERT INTO polizas_urosalud
      (empleado_id, numero_poliza, fecha_afiliacion, fecha_vencimiento,
       asesor, plan_contratado, monto_prima, moneda, estado, observaciones)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [data.empleado_id, data.numero_poliza, data.fecha_afiliacion,
     data.fecha_vencimiento, data.asesor, data.plan_contratado,
     data.monto_prima, data.moneda || 'Bs', data.estado || 'Activa', data.observaciones]
  ),

  update: (id, data) => {
    const fields = []; const params = []; let i = 1;
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) { fields.push(`${k} = $${i++}`); params.push(v); }
    }
    params.push(id);
    return query(
      `UPDATE polizas_urosalud SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${i} RETURNING *`, params
    );
  },

  resumen: () => query(
    `SELECT plan_contratado, COUNT(*) AS total, SUM(monto_prima) AS prima_total
     FROM polizas_urosalud WHERE estado = 'Activa'
     GROUP BY plan_contratado ORDER BY total DESC`
  ),
};

module.exports = Poliza;
