const { Router } = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const ctrl = require('../controllers/usuarios.controller');

const router = Router();
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.put('/:id/toggle', ctrl.toggleActive);

module.exports = router;
