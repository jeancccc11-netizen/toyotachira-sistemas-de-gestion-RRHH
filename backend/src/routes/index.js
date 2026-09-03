const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth');

const authRoutes = require('./auth.routes');
const departamentosRoutes = require('./departamentos.routes');
const empleadosRoutes = require('./empleados.routes');
const documentosRoutes = require('./documentos.routes');
const examenesRoutes = require('./examenes.routes');
const vacacionesRoutes = require('./vacaciones.routes');
const urosaludRoutes = require('./urosalud.routes');
const nominaRoutes = require('./nomina.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/departamentos', departamentosRoutes);
router.use('/empleados', empleadosRoutes);
router.use('/documentos', documentosRoutes);
router.use('/examenes', examenesRoutes);
router.use('/vacaciones', vacacionesRoutes);
router.use('/urosalud', urosaludRoutes);
router.use('/nomina', nominaRoutes);

// Dashboard stats
router.get('/dashboard', authMiddleware, async (req, res, next) => {
  try {
    const { query } = require('../config/database');
    const [emp, solPend, reposos, polizas, ultimaNomina] = await Promise.all([
      query(`SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE estado_operativo = 'Activo') AS activos,
             COUNT(*) FILTER (WHERE estado_operativo = 'Vacaciones') AS vacaciones,
             COUNT(*) FILTER (WHERE estado_operativo = 'Reposo') AS reposo
             FROM empleados`),
      query(`SELECT COUNT(*) AS total FROM solicitudes_vacaciones WHERE estado = 'Solicitada'`),
      query(`SELECT COUNT(*) AS total FROM examenes_medicos_reposos
             WHERE tipo_registro = 'Reposo Médico' AND fecha_reintegro IS NULL`),
      query(`SELECT COUNT(*) AS total, SUM(monto_prima) AS prima_total
             FROM polizas_urosalud WHERE estado = 'Activa'`),
      query(`SELECT id, quincena, mes, anio, estatus FROM periodos_nomina
             ORDER BY anio DESC, mes DESC, quincena DESC LIMIT 1`),
    ]);
    res.json({
      empleados: emp.rows[0],
      solicitudes_pendientes: parseInt(solPend.rows[0].total),
      reposos_activos: parseInt(reposos.rows[0].total),
      polizas: polizas.rows[0],
      ultima_nomina: ultimaNomina.rows[0] || null,
    });
  } catch (err) { next(err); }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SI-GHR API', version: '1.0.0' });
});

module.exports = router;
