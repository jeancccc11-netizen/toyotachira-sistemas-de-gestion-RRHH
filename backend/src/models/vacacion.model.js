const { query } = require('../config/database');

const Vacacion = {
  getPeriodos: (empleadoId) =>
    query(
      `SELECT pv.*, e.nombre_completo
       FROM periodos_vacacionales pv
       JOIN empleados e ON pv.empleado_id = e.id
       WHERE pv.empleado_id = $1 ORDER BY pv.anio_periodo DESC`,
      [empleadoId]
    ),

  getPeriodoActual: (empleadoId, anio) =>
    query(
      `SELECT * FROM periodos_vacacionales
       WHERE empleado_id = $1 AND anio_periodo = $2`,
      [empleadoId, anio]
    ),

  upsertPeriodo: (empleadoId, anio, diasAcumulados, salarioDiario) =>
    query(
      `INSERT INTO periodos_vacacionales (empleado_id, anio_periodo, dias_acumulados, salario_diario)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (empleado_id, anio_periodo)
       DO UPDATE SET dias_acumulados = $3, salario_diario = $4, updated_at = NOW()
       RETURNING *`,
      [empleadoId, anio, diasAcumulados, salarioDiario]
    ),

  registrarDisfrute: (periodoId, dias) =>
    query(
      `UPDATE periodos_vacacionales
       SET dias_disfrute = dias_disfrute + $2, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [periodoId, dias]
    ),

  getSolicitudes: (empleadoId) =>
    query(
      `SELECT sv.*, e.nombre_completo
       FROM solicitudes_vacaciones sv
       JOIN empleados e ON sv.empleado_id = e.id
       WHERE sv.empleado_id = $1 ORDER BY sv.fecha_salida DESC`,
      [empleadoId]
    ),

  getSolicitudesPendientes: () =>
    query(
      `SELECT sv.*, e.nombre_completo, e.cedula, d.nombre AS departamento
       FROM solicitudes_vacaciones sv
       JOIN empleados e ON sv.empleado_id = e.id
       JOIN departamentos d ON e.departamento_id = d.id
       WHERE sv.estado = 'Solicitada'
       ORDER BY sv.fecha_salida`
    ),

  crearSolicitud: (data) =>
    query(
      `INSERT INTO solicitudes_vacaciones
        (empleado_id, periodo_vacacional_id, fecha_salida, fecha_regreso,
         dias_solicitados, estado, motivo)
       VALUES ($1,$2,$3,$4,$5,'Solicitada',$6) RETURNING *`,
      [data.empleado_id, data.periodo_vacacional_id, data.fecha_salida,
       data.fecha_regreso, data.dias_solicitados, data.motivo]
    ),

  aprobarSolicitud: (id, aprobadoPor) =>
    query(
      `UPDATE solicitudes_vacaciones
       SET estado = 'Aprobada', aprobado_por = $2,
           fecha_aprobacion = NOW(), updated_at = NOW()
       WHERE id = $1 AND estado = 'Solicitada' RETURNING *`,
      [id, aprobadoPor]
    ),

  rechazarSolicitud: (id) =>
    query(
      `UPDATE solicitudes_vacaciones
       SET estado = 'Rechazada', updated_at = NOW()
       WHERE id = $1 AND estado = 'Solicitada' RETURNING *`,
      [id]
    ),
};

module.exports = Vacacion;
