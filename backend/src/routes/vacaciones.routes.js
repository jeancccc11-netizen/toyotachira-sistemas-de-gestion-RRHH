const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const periodo = require('../controllers/vacaciones.periodo.controller');
const sol = require('../controllers/vacaciones.solicitud.controller');
const hist = require('../controllers/vacaciones.historial.controller');

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

// Historial
router.get('/historial/todas', hist.allSolicitudes);
router.get('/historial/estados', hist.resumenEstados);
router.get('/historial/periodos', hist.periodosDisponibles);
router.get('/historial/empleado/:empleadoId', hist.byEmpleado);

module.exports = router;
