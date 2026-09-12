const Historial = require('../models/vacacion.historial.model');

const vacacionHistorialController = {
  allSolicitudes: async (_req, res, next) => {
    try {
      const result = await Historial.getAllSolicitudes();
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  byEmpleado: async (req, res, next) => {
    try {
      const result = await Historial.getHistorialByEmpleado(req.params.empleadoId);
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  resumenEstados: async (_req, res, next) => {
    try {
      const result = await Historial.getEstadosResumen();
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  periodosDisponibles: async (_req, res, next) => {
    try {
      const result = await Historial.getPeriodosDisponibles();
      res.json(result.rows);
    } catch (err) { next(err); }
  },
};

module.exports = vacacionHistorialController;
