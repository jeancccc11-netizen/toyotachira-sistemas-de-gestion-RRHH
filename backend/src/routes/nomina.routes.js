const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');
const periodo = require('../controllers/nomina.periodo.controller');
const detalle = require('../controllers/nomina.detalle.controller');
const exp = require('../controllers/nomina.export.controller');
const pdf = require('../controllers/nomina.pdf.controller');
const imp = require('../controllers/nomina.import.controller');
const hist = require('../controllers/nomina.historial.controller');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

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

// Historial
router.get('/historial/todos', hist.periodosHistorial);
router.get('/historial/:id', hist.periodoDetalle);

// Import/Export
router.post('/:nominaId/import', upload.single('archivo'), imp.importExcel);
router.get('/:nominaId/recibo/:detalleId/pdf', pdf.pdf);
router.get('/:nominaId/export/excel', exp.excel);

module.exports = router;
