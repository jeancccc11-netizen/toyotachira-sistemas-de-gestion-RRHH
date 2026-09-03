const Nomina = require('../models/nomina.model');
const { query } = require('../config/database');

const nominaDetalleController = {
  list: async (req, res, next) => {
    try {
      const result = await Nomina.findDetalles(req.params.nominaId);
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  upsert: async (req, res, next) => {
    try {
      const result = await Nomina.upsertDetalle({
        nomina_id: parseInt(req.params.nominaId),
        ...req.body,
      });
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try {
      const result = await query(
        `DELETE FROM detalles_nomina
         WHERE id = $1 AND nomina_id = $2 RETURNING id`,
        [req.params.detalleId, req.params.nominaId]
      );
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Detalle no encontrado' });
      }
      res.json({ message: 'Detalle eliminado' });
    } catch (err) { next(err); }
  },

  resumenDepartamento: async (req, res, next) => {
    try {
      const result = await Nomina.resumenDepartamento(req.params.nominaId);
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  total: async (req, res, next) => {
    try {
      const result = await Nomina.totalNomina(req.params.nominaId);
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },
};

module.exports = nominaDetalleController;
