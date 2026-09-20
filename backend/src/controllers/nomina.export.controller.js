const Nomina = require('../models/nomina.model');
const XLSX = require('xlsx');

const nominaExportController = {
  excel: async (req, res, next) => {
    try {
      const result = await Nomina.findDetalles(req.params.nominaId);
      const data = result.rows.map((d) => ({
        Empleado: d.nombre_completo, Cédula: d.cedula,
        Departamento: d.departamento, 'Sueldo Base': d.sueldo_base,
        Comisión: d.comision_mensual, Bonificación: d.bonificacion,
        Vacaciones: d.asignacion_vacaciones, Bonos: d.asignacion_bonos,
        Extra: d.asignacion_extra, 'Seg. Social': d.deduccion_seguro_social,
        PARO: d.deduccion_paro, INCES: d.deduccion_inces,
        ISLR: d.deduccion_islr, Urosalud: d.deduccion_urosalud,
        Anticipos: d.deduccion_anticipos, Otros: d.deduccion_otros,
        'Total Asignaciones': d.total_asignaciones,
        'Total Deducciones': d.total_deducciones,
        'Neto a Pagar': d.neto_a_pagar,
      }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Nómina');
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition',
        `attachment; filename=nomina-${req.params.nominaId}.xlsx`);
      res.send(buf);
    } catch (err) { next(err); }
  },
};

module.exports = nominaExportController;
