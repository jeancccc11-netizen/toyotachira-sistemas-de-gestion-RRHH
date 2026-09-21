const Examen = require('../models/examen.model');

const examenesController = {
  // GET /api/examenes
  listAll: async (_req, res, next) => {
    try {
      const result = await Examen.findAll();
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  // GET /api/examenes/empleado/:empleadoId
  listByEmpleado: async (req, res, next) => {
    try {
      const result = await Examen.findByEmpleado(req.params.empleadoId);
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/examenes/reposos-activos
  repososActivos: async (req, res, next) => {
    try {
      const result = await Examen.findRepososActivos();
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/examenes
  create: async (req, res, next) => {
    try {
      const required = ['empleado_id', 'tipo_registro'];
      for (const field of required) {
        if (!req.body[field]) {
          return res.status(400).json({ error: `${field} es obligatorio` });
        }
      }

      const result = await Examen.create(req.body);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/examenes/:id
  update: async (req, res, next) => {
    try {
      const { query } = require('../config/database');
      const fields = [];
      const params = [];
      let i = 1;
      for (const [k, v] of Object.entries(req.body)) {
        if (v !== undefined) { fields.push(`${k} = $${i++}`); params.push(v); }
      }
      if (fields.length === 0) return res.status(400).json({ error: 'Nada que actualizar' });
      params.push(req.params.id);
      const result = await query(
        `UPDATE examenes_medicos_reposos SET ${fields.join(', ')}, updated_at = NOW()
         WHERE id = $${i} RETURNING *`, params
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },

  // PUT /api/examenes/:id/reintegro
  registrarReintegro: async (req, res, next) => {
    try {
      const { fecha_reintegro } = req.body;
      if (!fecha_reintegro) return res.status(400).json({ error: 'fecha_reintegro requerida' });
      const { query } = require('../config/database');
      const result = await query(
        `UPDATE examenes_medicos_reposos
         SET fecha_reintegro = $1, updated_at = NOW()
         WHERE id = $2 RETURNING *`,
        [fecha_reintegro, req.params.id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },

  // DELETE /api/examenes/:id
  remove: async (req, res, next) => {
    try {
      const { query } = require('../config/database');
      const result = await query('DELETE FROM examenes_medicos_reposos WHERE id = $1 RETURNING id', [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
      res.json({ message: 'Eliminado' });
    } catch (err) { next(err); }
  },
};

module.exports = examenesController;
