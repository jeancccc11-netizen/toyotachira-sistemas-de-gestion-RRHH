const Vacacion = require('../models/vacacion.model');
const { query } = require('../config/database');

const calcularDias = (anioIngreso, anioPeriodo) => {
  const antiguedad = anioPeriodo - anioIngreso;
  return 15 + Math.min(Math.max(antiguedad, 0), 15);
};

const vacacionesPeriodoController = {
  getPeriodos: async (req, res, next) => {
    try {
      const result = await Vacacion.getPeriodos(req.params.empleadoId);
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  calcular: async (req, res, next) => {
    try {
      const { empleado_id, anio_periodo } = req.body;
      if (!empleado_id || !anio_periodo) {
        return res.status(400).json({ error: 'empleado_id y anio_periodo requeridos' });
      }
      const existing = await Vacacion.getPeriodoActual(empleado_id, anio_periodo);
      if (existing.rows.length) return res.json(existing.rows[0]);

      const emp = await query(
        'SELECT fecha_ingreso, salario_base FROM empleados WHERE id = $1',
        [empleado_id]
      );
      if (!emp.rows.length) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
      const { fecha_ingreso, salario_base } = emp.rows[0];
      const anioIngreso = new Date(fecha_ingreso).getFullYear();
      const dias = calcularDias(anioIngreso, anio_periodo);
      const salarioDiario = (parseFloat(salario_base) / 30).toFixed(2);

      const result = await Vacacion.upsertPeriodo(
        empleado_id, anio_periodo, dias, salarioDiario
      );
      res.json(result.rows[0]);
    } catch (err) { next(err); }
  },
};

module.exports = vacacionesPeriodoController;
