// Re-export split controllers for backwards compatibility
const poliza = require('./urosalud.poliza.controller');
const carga = require('./urosalud.carga.controller');

module.exports = {
  listPolizas: poliza.list,
  getPolizaById: poliza.getById,
  listByEmpleado: poliza.byEmpleado,
  createPoliza: poliza.create,
  updatePoliza: poliza.update,
  deletePoliza: poliza.remove,
  resumen: poliza.resumen,
  listCargas: carga.list,
  createCarga: carga.create,
  updateCarga: carga.update,
  deleteCarga: carga.remove,
};
