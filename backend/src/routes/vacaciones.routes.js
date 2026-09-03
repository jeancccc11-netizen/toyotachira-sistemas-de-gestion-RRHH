const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const periodo = require('../controllers/vacaciones.periodo.controller');
const sol = require('../controllers/vacaciones.solicitud.controller');

const router = Router();
router.use(authMiddleware);

// Períodos
router.get('/periodos/:empleadoId', periodo.getPeriodos);
router.post('/periodos/calcular', periodo.calcular);

// Solicitudes
router.get('/solicitudes/pendientes', sol.pendientes);
router.get('/solicitudes/:empleadoId', sol.byEmpleado);
router.post('/solicitudes', sol.crear);
router.put('/solicitudes/:id/aprobar', sol.aprobar);
router.put('/solicitudes/:id/rechazar', sol.rechazar);
router.delete('/solicitudes/:id', sol.remove);

module.exports = router;
