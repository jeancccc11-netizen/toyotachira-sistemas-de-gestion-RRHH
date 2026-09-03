const path = require('path');
const fs = require('fs');
const Documento = require('../models/documento.model');
const env = require('../config/env');

const documentosController = {
  // GET /api/documentos/empleado/:empleadoId
  listByEmpleado: async (req, res, next) => {
    try {
      const result = await Documento.findByEmpleado(req.params.empleadoId);
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/documentos/stats
  stats: async (req, res, next) => {
    try {
      const result = await Documento.countByTipo();
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/documentos/upload
  upload: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Archivo requerido' });
      }

      const { empleado_id, tipo_documento, observaciones } = req.body;
      if (!empleado_id || !tipo_documento) {
        return res.status(400).json({ error: 'empleado_id y tipo_documento requeridos' });
      }

      const result = await Documento.create({
        empleado_id: parseInt(empleado_id),
        tipo_documento,
        nombre_archivo: req.file.originalname,
        ruta_archivo: req.file.path,
        observaciones,
      });

      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/documentos/:id/download
  download: async (req, res, next) => {
    try {
      const result = await Documento.findById(req.params.id);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }

      const doc = result.rows[0];
      if (!fs.existsSync(doc.ruta_archivo)) {
        return res.status(404).json({ error: 'Archivo no encontrado en disco' });
      }

      res.download(doc.ruta_archivo, doc.nombre_archivo);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/documentos/:id
  delete: async (req, res, next) => {
    try {
      const result = await Documento.delete(req.params.id);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Documento no encontrado' });
      }

      const doc = result.rows[0];
      if (fs.existsSync(doc.ruta_archivo)) {
        fs.unlinkSync(doc.ruta_archivo);
      }

      res.json({ message: 'Documento eliminado' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = documentosController;
