const path = require('path');
const fs = require('fs');
const Documento = require('../models/documento.model');
const DocFolders = require('../models/documento.folders.model');
const env = require('../config/env');

const documentosController = {
  listByEmpleado: async (req, res, next) => {
    try {
      const result = await Documento.findByEmpleado(req.params.empleadoId);
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  stats: async (req, res, next) => {
    try {
      const result = await Documento.countByTipo();
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  upload: async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });
      const { empleado_id, tipo_documento, observaciones } = req.body;
      if (!empleado_id || !tipo_documento) {
        return res.status(400).json({ error: 'empleado_id y tipo_documento requeridos' });
      }
      const result = await Documento.create({
        empleado_id: parseInt(empleado_id), tipo_documento,
        nombre_archivo: req.file.originalname, ruta_archivo: req.file.path,
        observaciones,
      });
      res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
  },

  download: async (req, res, next) => {
    try {
      const result = await Documento.findById(req.params.id);
      if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
      const doc = result.rows[0];
      if (!fs.existsSync(doc.ruta_archivo)) {
        return res.status(404).json({ error: 'Archivo no encontrado en disco' });
      }
      res.download(doc.ruta_archivo, doc.nombre_archivo);
    } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try {
      const result = await Documento.delete(req.params.id);
      if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
      const doc = result.rows[0];
      if (fs.existsSync(doc.ruta_archivo)) fs.unlinkSync(doc.ruta_archivo);
      res.json({ message: 'Documento eliminado' });
    } catch (err) { next(err); }
  },

  folders: async (req, res, next) => {
    try {
      const result = await DocFolders.getFoldersByEmpleado(req.params.empleadoId);
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  byFolder: async (req, res, next) => {
    try {
      const result = await DocFolders.getDocsByFolder(
        req.params.empleadoId, req.params.carpeta
      );
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  updateFolder: async (req, res, next) => {
    try {
      const result = await DocFolders.updateFolder(req.params.id, req.body.carpeta);
      if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },
};

module.exports = documentosController;
