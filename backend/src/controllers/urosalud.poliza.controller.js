const Urosalud = require('../models/urosalud.model');

const urosaludPolizaController = {
  list: async (req, res, next) => {
    try {
      const result = await Urosalud.findAll(req.query);
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try {
      const result = await Urosalud.findById(req.params.id);
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Póliza no encontrada' });
      }
      const poliza = result.rows[0];
      const cargas = await Urosalud.findCargas(poliza.id);
      res.json({ ...poliza, cargas: cargas.rows });
    } catch (err) { next(err); }
  },

  byEmpleado: async (req, res, next) => {
    try {
      const result = await Urosalud.findByEmpleado(req.params.empleadoId);
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const required = ['empleado_id', 'fecha_afiliacion', 'plan_contratado', 'monto_prima'];
      for (const f of required) {
        if (!req.body[f]) return res.status(400).json({ error: `${f} es obligatorio` });
      }
      const result = await Urosalud.create(req.body);
      res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const result = await Urosalud.update(req.params.id, req.body);
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Póliza no encontrada' });
      }
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try {
      const { query } = require('../config/database');
      const result = await query(
        'DELETE FROM polizas_urosalud WHERE id = $1 RETURNING id',
        [req.params.id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Póliza no encontrada' });
      }
      res.json({ message: 'Póliza eliminada' });
    } catch (err) { next(err); }
  },

  resumen: async (_req, res, next) => {
    try {
      const result = await Urosalud.resumen();
      res.json(result.rows);
    } catch (err) { next(err); }
  },
};

module.exports = urosaludPolizaController;
