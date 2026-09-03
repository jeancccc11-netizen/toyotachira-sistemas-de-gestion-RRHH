// Re-export split models for backwards compatibility
const Poliza = require('./urosalud.poliza.model');
const Carga = require('./urosalud.carga.model');

module.exports = {
  findAll: Poliza.findAll,
  findById: Poliza.findById,
  findByEmpleado: Poliza.findByEmpleado,
  create: Poliza.create,
  update: Poliza.update,
  resumen: Poliza.resumen,
  findCargas: Carga.findByPoliza,
  createCarga: Carga.create,
  updateCarga: Carga.update,
  deleteCarga: Carga.remove,
};
