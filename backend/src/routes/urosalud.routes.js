const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const poliza = require('../controllers/urosalud.poliza.controller');
const carga = require('../controllers/urosalud.carga.controller');

const router = Router();
router.use(authMiddleware);

// Pólizas
router.get('/polizas', poliza.list);
router.get('/polizas/resumen', poliza.resumen);
router.get('/polizas/empleado/:empleadoId', poliza.byEmpleado);
router.get('/polizas/:id', poliza.getById);
router.post('/polizas', poliza.create);
router.put('/polizas/:id', poliza.update);
router.delete('/polizas/:id', poliza.remove);

// Cargas
router.get('/cargas/:polizaId', carga.list);
router.post('/cargas', carga.create);
router.put('/cargas/:id', carga.update);
router.delete('/cargas/:id', carga.remove);

module.exports = router;
