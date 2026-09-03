const { query } = require('../config/database');

const Empleado = {
  findAll: (filters = {}) => {
    let sql = `
      SELECT e.*, d.nombre AS departamento
      FROM empleados e
      JOIN departamentos d ON e.departamento_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let i = 1;

    if (filters.departamento_id) {
      sql += ` AND e.departamento_id = $${i++}`;
      params.push(filters.departamento_id);
    }
    if (filters.estado_operativo) {
      sql += ` AND e.estado_operativo = $${i++}`;
      params.push(filters.estado_operativo);
    }
    if (filters.search) {
      sql += ` AND (e.nombre_completo ILIKE $${i} OR e.cedula ILIKE $${i} OR e.nro::text ILIKE $${i})`;
      params.push(`%${filters.search}%`);
      i++;
    }

    sql += ' ORDER BY e.nombre_completo';
    if (filters.limit) {
      sql += ` LIMIT $${i++} OFFSET $${i++}`;
      params.push(filters.limit, filters.offset || 0);
    }

    return query(sql, params);
  },

  findById: (id) =>
    query(
      `SELECT e.*, d.nombre AS departamento
       FROM empleados e
       JOIN departamentos d ON e.departamento_id = d.id
       WHERE e.id = $1`,
      [id]
    ),

  create: (data) =>
    query(
      `INSERT INTO empleados
        (nro, cedula, nombre_completo, departamento_id, posicion_cargo,
         fecha_ingreso, salario_base, estado_operativo, tipo_tasa,
         porcentaje_bs, porcentaje_usd, grupo, email, telefono, direccion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        data.nro, data.cedula, data.nombre_completo, data.departamento_id,
        data.posicion_cargo, data.fecha_ingreso, data.salario_base,
        data.estado_operativo || 'Activo', data.tipo_tasa,
        data.porcentaje_bs, data.porcentaje_usd, data.grupo,
        data.email, data.telefono, data.direccion,
      ]
    ),

  update: (id, data) => {
    const fields = [];
    const params = [];
    let i = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${i++}`);
        params.push(value);
      }
    }

    params.push(id);
    return query(
      `UPDATE empleados SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params
    );
  },

  count: () => query('SELECT COUNT(*) AS total FROM empleados'),

  countByStatus: () =>
    query(
      `SELECT estado_operativo, COUNT(*) AS total
       FROM empleados GROUP BY estado_operativo`
    ),

  remove: (id) =>
    query('DELETE FROM empleados WHERE id = $1 RETURNING id', [id]),
};

module.exports = Empleado;
