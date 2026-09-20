const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario.model');

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

  toggleActive: async (req, res, next) => {
    try {
      const { activo } = req.body;
      const result = await Usuario.toggleActive(req.params.id, activo);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },
};

module.exports = usuariosController;
