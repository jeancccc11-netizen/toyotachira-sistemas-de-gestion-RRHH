const Urosalud = require('../models/urosalud.model');

const urosaludCargaController = {
  list: async (req, res, next) => {
    try {
      const result = await Urosalud.findCargas(req.params.polizaId);
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const required = ['poliza_id', 'nombre_completo', 'parentesco'];
      for (const f of required) {
        if (!req.body[f]) return res.status(400).json({ error: `${f} es obligatorio` });
      }
      const result = await Urosalud.createCarga(req.body);
      res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
  },

  update: async (req, res, next) => {
    try {
      const result = await Urosalud.updateCarga(req.params.id, req.body);
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Carga no encontrada' });
      }
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try {
      const result = await Urosalud.deleteCarga(req.params.id);
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Carga no encontrada' });
      }
      res.json({ message: 'Carga eliminada' });
    } catch (err) { next(err); }
  },
};

module.exports = urosaludCargaController;
