const Nomina = require('../models/nomina.model');

const nominaPeriodoController = {
  list: async (_req, res, next) => {
    try {
      const result = await Nomina.findAllPeriodos();
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  getById: async (req, res, next) => {
    try {
      const result = await Nomina.findPeriodoById(req.params.id);
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Período no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const { quincena, mes, anio, fecha_inicio, fecha_fin } = req.body;
      if (!quincena || !mes || !anio || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }
      const result = await Nomina.createPeriodo(req.body);
      res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const { query } = require('../config/database');
      const { estatus } = req.body;
      const result = await query(
        `UPDATE periodos_nomina SET estatus = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [estatus, req.params.id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Período no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try {
      const { query } = require('../config/database');
      const result = await query(
        'DELETE FROM periodos_nomina WHERE id = $1 RETURNING id',
        [req.params.id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Período no encontrado' });
      }
      res.json({ message: 'Período eliminado' });
    } catch (err) { next(err); }
  },
};

module.exports = nominaPeriodoController;
