const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario.model');

const ROL_VALIDOS = ['admin', 'rrhh', 'nómina', 'consulta'];

const usuariosController = {
  list: async (_req, res, next) => {
    try {
      const result = await Usuario.findAll();
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const { username, password, rol, empleado_id } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      if (rol && !ROL_VALIDOS.includes(rol)) {
        return res.status(400).json({ error: `Rol inválido. Válidos: ${ROL_VALIDOS.join(', ')}` });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await Usuario.create({
        username,
        passwordHash,
        rol,
        empleadoId: empleado_id,
      });
      res.status(201).json({ message: 'Usuario creado', user: result.rows[0] });
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'El usuario ya existe' });
      }
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { username, rol, empleado_id, activo } = req.body;
      if (rol !== undefined && rol !== null && !ROL_VALIDOS.includes(rol)) {
        return res.status(400).json({ error: `Rol inválido. Válidos: ${ROL_VALIDOS.join(', ')}` });
      }
      if (username !== undefined && !String(username).trim()) {
        return res.status(400).json({ error: 'El nombre de usuario no puede estar vacío' });
      }
      // Un admin no puede bloquearse a sí mismo
      if (activo === false && Number(req.params.id) === req.user.id) {
        return res.status(400).json({ error: 'No puedes desactivar tu propio usuario' });
      }
      const result = await Usuario.update(req.params.id, {
        username: username !== undefined ? String(username).trim() : undefined,
        rol: rol ?? undefined,
        empleadoId: empleado_id !== undefined ? (empleado_id || null) : undefined,
        activo,
      });
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Ese nombre de usuario ya existe' });
      }
      next(err);
    }
  },

  updatePassword: async (req, res, next) => {
    try {
      const { password } = req.body;
      if (!password || String(password).length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await Usuario.updatePassword(req.params.id, passwordHash);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json({ message: 'Contraseña actualizada' });
    } catch (err) { next(err); }
  },

  toggleActive: async (req, res, next) => {
    try {
      const { activo } = req.body;
      if (activo === false && Number(req.params.id) === req.user.id) {
        return res.status(400).json({ error: 'No puedes desactivar tu propio usuario' });
      }
      const result = await Usuario.toggleActive(req.params.id, activo);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try {
      if (Number(req.params.id) === req.user.id) {
        return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
      }
      const result = await Usuario.remove(req.params.id);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json({ message: 'Usuario eliminado', id: result.rows[0].id });
    } catch (err) { next(err); }
  },
};

module.exports = usuariosController;
