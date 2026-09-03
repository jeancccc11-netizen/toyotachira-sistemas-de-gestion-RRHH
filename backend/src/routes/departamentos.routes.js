const { Router } = require('express');
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

// GET /api/departamentos
router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM departamentos ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/departamentos
router.post('/', async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
    const result = await query(
      'INSERT INTO departamentos (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/departamentos/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    const result = await query(
      'UPDATE departamentos SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion) WHERE id = $3 RETURNING *',
      [nombre, descripcion, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/departamentos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await query('DELETE FROM departamentos WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Departamento eliminado', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
