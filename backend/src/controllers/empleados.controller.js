const Empleado = require('../models/empleado.model');

const empleadosController = {
  // GET /api/empleados
  list: async (req, res, next) => {
    try {
      const { departamento_id, estado_operativo, search, limit = 50, offset = 0 } = req.query;
      const result = await Empleado.findAll({
        departamento_id,
        estado_operativo,
        search,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/empleados/stats
  stats: async (req, res, next) => {
    try {
      const [total, byStatus] = await Promise.all([
        Empleado.count(),
        Empleado.countByStatus(),
      ]);
      res.json({
        total: parseInt(total.rows[0].total),
        por_estado: byStatus.rows,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/empleados/:id
  getById: async (req, res, next) => {
    try {
      const result = await Empleado.findById(req.params.id);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/empleados
  create: async (req, res, next) => {
    try {
      const result = await Empleado.create(req.body);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/empleados/:id
  update: async (req, res, next) => {
    try {
      const result = await Empleado.update(req.params.id, req.body);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/empleados/:id
  remove: async (req, res, next) => {
    try {
      const result = await Empleado.remove(req.params.id);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
      res.json({ message: 'Empleado eliminado', id: result.rows[0].id });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = empleadosController;
