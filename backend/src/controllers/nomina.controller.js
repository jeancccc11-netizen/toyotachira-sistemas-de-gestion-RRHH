// Re-export split controllers for backwards compatibility
const periodo = require('./nomina.periodo.controller');
const detalle = require('./nomina.detalle.controller');
const exp = require('./nomina.export.controller');

module.exports = {
  listPeriodos: periodo.list,
  getPeriodoById: periodo.getById,
  createPeriodo: periodo.create,
  listDetalles: detalle.list,
  upsertDetalle: detalle.upsert,
  removeDetalle: detalle.remove,
  resumenDepartamento: detalle.resumenDepartamento,
  totalNomina: detalle.total,
  exportReciboPDF: exp.pdf,
  exportExcel: exp.excel,
};
