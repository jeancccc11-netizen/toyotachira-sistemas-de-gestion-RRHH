// Re-export split controllers for backwards compatibility
const periodo = require('./vacaciones.periodo.controller');
const sol = require('./vacaciones.solicitud.controller');

module.exports = {
  getPeriodos: periodo.getPeriodos,
  calcularPeriodo: periodo.calcular,
  solicitudesPendientes: sol.pendientes,
  solicitudesByEmpleado: sol.byEmpleado,
  crearSolicitud: sol.crear,
  aprobar: sol.aprobar,
  rechazar: sol.rechazar,
  remove: sol.remove,
};
