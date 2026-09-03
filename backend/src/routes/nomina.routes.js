const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const periodo = require('../controllers/nomina.periodo.controller');
const detalle = require('../controllers/nomina.detalle.controller');
const exp = require('../controllers/nomina.export.controller');

const router = Router();
router.use(authMiddleware);

// Períodos
router.get('/periodos', periodo.list);
router.get('/periodos/:id', periodo.getById);
router.post('/periodos', periodo.create);
router.put('/periodos/:id', periodo.update);
router.delete('/periodos/:id', periodo.remove);

// Detalles
router.get('/:nominaId/detalles', detalle.list);
router.post('/:nominaId/detalles', detalle.upsert);
router.put('/:nominaId/detalles', detalle.upsert);
router.delete('/:nominaId/detalles/:detalleId', detalle.remove);

// Resumen
router.get('/:nominaId/resumen-departamento', detalle.resumenDepartamento);
router.get('/:nominaId/total', detalle.total);

// Export
router.get('/:id/recibo/:detalleId/pdf', exp.pdf);
router.get('/:id/export/excel', exp.excel);

module.exports = router;
