const { query } = require('../config/database');

const Nomina = {
  // PERÍODOS
  findAllPeriodos: () =>
    query('SELECT * FROM periodos_nomina ORDER BY anio DESC, mes DESC, quincena'),

  findPeriodoById: (id) =>
    query('SELECT * FROM periodos_nomina WHERE id = $1', [id]),

  createPeriodo: (data) =>
    query(
      `INSERT INTO periodos_nomina (quincena, mes, anio, fecha_inicio, fecha_fin, estatus)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [data.quincena, data.mes, data.anio, data.fecha_inicio, data.fecha_fin,
       data.estatus || 'Borrador']
    ),

  updatePeriodo: (id, data) => {
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
      `UPDATE periodos_nomina SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${i} RETURNING *`, params
    );
  },

  // DETALLES
  findDetalles: (nominaId) =>
    query(
      `SELECT dn.*, e.nombre_completo, e.cedula, d.nombre AS departamento
       FROM detalles_nomina dn
       JOIN empleados e ON dn.empleado_id = e.id
       JOIN departamentos d ON e.departamento_id = d.id
       WHERE dn.nomina_id = $1
       ORDER BY d.nombre, e.nombre_completo`,
      [nominaId]
    ),

  findDetalleById: (id) =>
    query('SELECT * FROM detalles_nomina WHERE id = $1', [id]),

  upsertDetalle: (data) =>
    query(
      `INSERT INTO detalles_nomina
        (nomina_id, empleado_id, sueldo_base, comision_mensual, bonificacion,
         asignacion_vacaciones, asignacion_bonos, asignacion_extra,
         deduccion_seguro_social, deduccion_paro, deduccion_inces,
         deduccion_islr, deduccion_urosalud, deduccion_anticipos, deduccion_otros)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (nomina_id, empleado_id)
       DO UPDATE SET
         sueldo_base = $3, comision_mensual = $4, bonificacion = $5,
         asignacion_vacaciones = $6, asignacion_bonos = $7, asignacion_extra = $8,
         deduccion_seguro_social = $9, deduccion_paro = $10, deduccion_inces = $11,
         deduccion_islr = $12, deduccion_urosalud = $13,
         deduccion_anticipos = $14, deduccion_otros = $15, updated_at = NOW()
       RETURNING *`,
      [data.nomina_id, data.empleado_id, data.sueldo_base || 0,
       data.comision_mensual || 0, data.bonificacion || 0,
       data.asignacion_vacaciones || 0, data.asignacion_bonos || 0,
       data.asignacion_extra || 0, data.deduccion_seguro_social || 0,
       data.deduccion_paro || 0, data.deduccion_inces || 0,
       data.deduccion_islr || 0, data.deduccion_urosalud || 0,
       data.deduccion_anticipos || 0, data.deduccion_otros || 0]
    ),

  resumenDepartamento: (nominaId) =>
    query(
      `SELECT * FROM v_resumen_nomina_departamento
       WHERE (anio, mes, quincena) = (
         SELECT anio, mes, quincena FROM periodos_nomina WHERE id = $1
       )`,
      [nominaId]
    ),

  totalNomina: (nominaId) =>
    query(
      `SELECT COUNT(*) AS total_empleados,
              SUM(total_asignaciones) AS total_asignaciones,
              SUM(total_deducciones) AS total_deducciones,
              SUM(neto_a_pagar) AS total_neto
       FROM detalles_nomina WHERE nomina_id = $1`,
      [nominaId]
    ),
};

module.exports = Nomina;
