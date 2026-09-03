const { Router } = require('express');
const ctrl = require('../controllers/empleados.controller');
const { authMiddleware } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');

const router = Router();
router.use(authMiddleware);

const createValidation = {
  nro: { type: 'number', required: true },
  cedula: { type: 'string', required: true, max: 20 },
  nombre_completo: { type: 'string', required: true, max: 150 },
  departamento_id: { type: 'number', required: true },
  fecha_ingreso: { type: 'date', required: true },
  salario_base: { type: 'number', required: true, min: 0 },
};

router.get('/stats', ctrl.stats);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', validateBody(createValidation), ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
