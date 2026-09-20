const { query } = require('../config/database');

const vacacionHistorialModel = {
  getAllSolicitudes: () =>
    query(
      `SELECT sv.*, e.nombre_completo, e.cedula,
              d.nombre AS departamento
       FROM solicitudes_vacaciones sv
       JOIN empleados e ON sv.empleado_id = e.id
       LEFT JOIN departamentos d ON e.departamento_id = d.id
       ORDER BY sv.fecha_salida DESC`
    ),

  getHistorialByEmpleado: (empleadoId) =>
    query(
      `SELECT sv.*, pv.anio_periodo, pv.dias_acumulados,
              pv.dias_pendientes
       FROM solicitudes_vacaciones sv
       JOIN empleados e ON sv.empleado_id = e.id
       LEFT JOIN periodos_vacacionales pv
         ON sv.periodo_vacacional_id = pv.id
       WHERE sv.empleado_id = $1
       ORDER BY sv.fecha_salida DESC`,
      [empleadoId]
    ),

  getEstadosResumen: () =>
    query(
      `SELECT estado, COUNT(*) AS total
       FROM solicitudes_vacaciones
       GROUP BY estado`
    ),

  getPeriodosDisponibles: () =>
    query(
      `SELECT pv.*, e.nombre_completo, e.cedula
       FROM periodos_vacacionales pv
       JOIN empleados e ON pv.empleado_id = e.id
       WHERE pv.dias_pendientes > 0
       ORDER BY pv.anio_periodo DESC, e.nombre_completo`
    ),
};

module.exports = vacacionHistorialModel;
