const Nomina = require('../models/nomina.model');
const PDFDocument = require('pdfkit');

const fmt = (v) => parseFloat(v || 0).toFixed(2);

const nominaPdfController = {
  pdf: async (req, res, next) => {
    try {
      const result = await Nomina.findDetalleById(req.params.detalleId);
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Detalle no encontrado' });
      }
      const d = result.rows[0];
      const doc = new PDFDocument({ size: 'letter', margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition',
        `attachment; filename=recibo-${d.id}.pdf`);
      doc.pipe(res);

      doc.fontSize(16).font('Helvetica-Bold')
        .text('TOYOTACHIRA S.A.', { align: 'center' });
      doc.fontSize(11).font('Helvetica')
        .text('Recibo de Pago — Nómina', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Empleado: `, 50, doc.y, { continued: true })
        .font('Helvetica').text(d.nombre_completo || 'N/A');
      doc.font('Helvetica-Bold').text(`Cédula: `, 50, doc.y, { continued: true })
        .font('Helvetica').text(d.cedula || 'N/A');
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(11).font('Helvetica-Bold').text('ASIGNACIONES');
      doc.moveDown(0.2);
      doc.font('Helvetica').fontSize(10);
      const assigns = [
        ['Sueldo Base', d.sueldo_base], ['Comisión Mensual', d.comision_mensual],
        ['Bonificación', d.bonificacion], ['Vacaciones', d.asignacion_vacaciones],
        ['Bonos', d.asignacion_bonos], ['Extra', d.asignacion_extra],
      ];
      for (const [label, val] of assigns) {
        doc.text(`  ${label}:`, { continued: true, width: 350 });
        doc.text(`${fmt(val)} Bs`, { align: 'right', width: 562 });
      }
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').text(`  TOTAL:`, { continued: true })
        .text(`${fmt(d.total_asignaciones)} Bs`, { align: 'right', width: 562 });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke();
      doc.moveDown(0.3);

      doc.fontSize(11).font('Helvetica-Bold').text('DEDUCCIONES');
      doc.moveDown(0.2);
      doc.font('Helvetica').fontSize(10);
      const deducts = [
        ['Seguro Social', d.deduccion_seguro_social], ['PARO', d.deduccion_paro],
        ['INCES', d.deduccion_inces], ['ISLR', d.deduccion_islr],
        ['Urosalud', d.deduccion_urosalud], ['Anticipos', d.deduccion_anticipos],
      ];
      for (const [label, val] of deducts) {
        doc.text(`  ${label}:`, { continued: true, width: 350 });
        doc.text(`-${fmt(val)} Bs`, { align: 'right', width: 562 });
      }
      doc.moveDown(0.3);
      doc.font('Helvetica-Bold').text(`  TOTAL:`, { continued: true })
        .text(`-${fmt(d.total_deducciones)} Bs`, { align: 'right', width: 562 });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(562, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(14).font('Helvetica-Bold')
        .text(`NETO A PAGAR: ${fmt(d.neto_a_pagar)} Bs`, { align: 'center' });
      doc.moveDown(1.5);
      doc.fontSize(9).font('Helvetica')
        .text('Firma: _______________________');
      doc.end();
    } catch (err) { next(err); }
  },
};

module.exports = nominaPdfController;
