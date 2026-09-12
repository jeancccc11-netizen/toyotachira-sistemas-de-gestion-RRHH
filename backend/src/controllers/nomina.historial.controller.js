const { query } = require('../config/database');

const nominaHistorialController = {
  periodosHistorial: async (_req, res, next) => {
    try {
      const result = await query(
        `SELECT p.*, COUNT(dn.id) AS total_empleados,
                SUM(dn.neto_a_pagar) AS total_neto
         FROM periodos_nomina p
         LEFT JOIN detalles_nomina dn ON dn.nomina_id = p.id
         GROUP BY p.id
         ORDER BY p.anio DESC, p.mes DESC, p.quincena`
      );
      res.json(result.rows);
    } catch (err) { next(err); }
  },

  periodoDetalle: async (req, res, next) => {
    try {
      const [periodo, detalles, resumen] = await Promise.all([
        query('SELECT * FROM periodos_nomina WHERE id = $1', [req.params.id]),
        query(
          `SELECT dn.*, e.nombre_completo, e.cedula, d.nombre AS departamento
           FROM detalles_nomina dn
           JOIN empleados e ON dn.empleado_id = e.id
           JOIN departamentos d ON e.departamento_id = d.id
           WHERE dn.nomina_id = $1 ORDER BY d.nombre, e.nombre_completo`,
          [req.params.id]
        ),
        query(
          `SELECT COUNT(*) AS total_empleados,
                  SUM(total_asignaciones) AS total_asignaciones,
                  SUM(total_deducciones) AS total_deducciones,
                  SUM(neto_a_pagar) AS total_neto
           FROM detalles_nomina WHERE nomina_id = $1`,
          [req.params.id]
        ),
      ]);
      if (!periodo.rows.length) {
        return res.status(404).json({ error: 'Período no encontrado' });
      }
      res.json({
        periodo: periodo.rows[0],
        detalles: detalles.rows,
        resumen: resumen.rows[0],
      });
    } catch (err) { next(err); }
  },
};

module.exports = nominaHistorialController;
