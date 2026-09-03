const Nomina = require('../models/nomina.model');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

const formatMoney = (val) => parseFloat(val || 0).toFixed(2) + ' Bs';

const writeAssignments = (doc, d) => {
  doc.fontSize(12).text('--- ASIGNACIONES ---');
  doc.fontSize(10);
  doc.text(`Sueldo Base: ${formatMoney(d.sueldo_base)}`);
  doc.text(`Comisión Mensual: ${formatMoney(d.comision_mensual)}`);
  doc.text(`Bonificación: ${formatMoney(d.bonificacion)}`);
  doc.text(`Asignación Vacaciones: ${formatMoney(d.asignacion_vacaciones)}`);
  doc.text(`Asignación Bonos: ${formatMoney(d.asignacion_bonos)}`);
  doc.text(`Asignación Extra: ${formatMoney(d.asignacion_extra)}`);
};

const writeDeductions = (doc, d) => {
  doc.moveDown().fontSize(12).text('--- DEDUCCIONES ---');
  doc.fontSize(10);
  doc.text(`Seguro Social: ${formatMoney(d.deduccion_seguro_social)}`);
  doc.text(`PARO: ${formatMoney(d.deduccion_paro)}`);
  doc.text(`INCES: ${formatMoney(d.deduccion_inces)}`);
  doc.text(`ISLR: ${formatMoney(d.deduccion_islr)}`);
  doc.text(`Urosalud: ${formatMoney(d.deduccion_urosalud)}`);
  doc.text(`Anticipos: ${formatMoney(d.deduccion_anticipos)}`);
  doc.text(`Otros: ${formatMoney(d.deduccion_otros)}`);
};

const nominaExportController = {
  pdf: async (req, res, next) => {
    try {
      const result = await Nomina.findDetalleById(req.params.detalleId);
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Detalle no encontrado' });
      }
      const d = result.rows[0];
      const doc = new PDFDocument({ size: 'letter', margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=recibo-${d.id}.pdf`);
      doc.pipe(res);

      doc.fontSize(18).text('TOYOTACHIRA S.A.', { align: 'center' });
      doc.fontSize(12).text('Recibo de Pago - Nómina', { align: 'center' });
      doc.moveDown().fontSize(10);
      doc.text(`ID: ${d.id} | Nómina: ${d.nomina_id}`);
      doc.moveDown();

      writeAssignments(doc, d);
      writeDeductions(doc, d);
      doc.moveDown();
      doc.fontSize(14).text(`NETO A PAGAR: ${formatMoney(d.neto_a_pagar)}`, { align: 'center' });
      doc.end();
    } catch (err) { next(err); }
  },

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
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=nomina-${req.params.nominaId}.xlsx`);
      res.send(buffer);
    } catch (err) { next(err); }
  },
};

module.exports = nominaExportController;
