const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');
const env = require('../config/env');

const authController = {
  // POST /api/auth/login
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }

      const result = await Usuario.findByUsername(username);
      const user = result.rows[0];

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      await Usuario.updateLastAccess(user.id);

      const token = jwt.sign(
        { id: user.id, username: user.username, rol: user.rol },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
      );

      res.json({
        token,
        user: { id: user.id, username: user.username, rol: user.rol },
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/auth/register
  register: async (req, res, next) => {
    try {
      const { username, password, rol, empleado_id } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const result = await Usuario.create({ username, passwordHash, rol, empleadoId: empleado_id });

      res.status(201).json({ message: 'Usuario creado', user: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/profile
  profile: async (req, res, next) => {
    try {
      const result = await Usuario.findById(req.user.id);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },

  // GET /api/auth/users
  listUsers: async (req, res, next) => {
    try {
      const result = await Usuario.findAll();
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
