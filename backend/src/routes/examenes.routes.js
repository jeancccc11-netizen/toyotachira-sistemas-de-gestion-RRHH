const { Router } = require('express');
const ctrl = require('../controllers/examenes.controller');
const { authMiddleware } = require('../middleware/auth');

const router = Router();
router.use(authMiddleware);

router.get('/', ctrl.listAll);
router.get('/empleado/:empleadoId', ctrl.listByEmpleado);
router.get('/reposos-activos', ctrl.repososActivos);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.put('/:id/reintegro', ctrl.registrarReintegro);
router.delete('/:id', ctrl.remove);

module.exports = router;
