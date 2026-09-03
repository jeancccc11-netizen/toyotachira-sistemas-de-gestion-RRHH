const Vacacion = require('../models/vacacion.model');
const { query } = require('../config/database');

const vacacionesSolicitudController = {
  pendientes: async (_req, res, next) => {
    try {
      const result = await Vacacion.getSolicitudesPendientes();
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  byEmpleado: async (req, res, next) => {
    try {
      const result = await Vacacion.getSolicitudes(req.params.empleadoId);
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  crear: async (req, res, next) => {
    try {
      const { empleado_id, fecha_salida, fecha_regreso, motivo } = req.body;
      if (!empleado_id || !fecha_salida || !fecha_regreso) {
        return res.status(400).json({ error: 'empleado_id, fecha_salida y fecha_regreso requeridos' });
      }
      const dias = Math.ceil(
        (new Date(fecha_regreso) - new Date(fecha_salida)) / 86400000
      );
      if (dias <= 0) {
        return res.status(400).json({ error: 'La fecha de regreso debe ser posterior a la de salida' });
      }
      const anio = new Date(fecha_salida).getFullYear();
      const periodo = await Vacacion.getPeriodoActual(empleado_id, anio);
      const periodoId = periodo.rows.length ? periodo.rows[0].id : null;

      const result = await Vacacion.crearSolicitud({
        empleado_id, fecha_salida, fecha_regreso,
        dias_solicitados: dias, periodo_vacacional_id: periodoId, motivo,
      });
      res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
  },

  aprobar: async (req, res, next) => {
    try {
      const result = await Vacacion.aprobarSolicitud(req.params.id, req.user.username);
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Solicitud no encontrada o ya procesada' });
      }
      const sol = result.rows[0];
      if (sol.periodo_vacacional_id) {
        await Vacacion.registrarDisfrute(sol.periodo_vacacional_id, sol.dias_solicitados);
      }
      res.json(sol);
    } catch (err) { next(err); }
  },

  rechazar: async (req, res, next) => {
    try {
      const result = await Vacacion.rechazarSolicitud(req.params.id);
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Solicitud no encontrada o ya procesada' });
      }
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },

  remove: async (req, res, next) => {
    try {
      const result = await query(
        'DELETE FROM solicitudes_vacaciones WHERE id = $1 RETURNING id',
        [req.params.id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ error: 'No encontrada' });
      }
      res.json({ message: 'Solicitud eliminada' });
    } catch (err) { next(err); }
  },
};

module.exports = vacacionesSolicitudController;
