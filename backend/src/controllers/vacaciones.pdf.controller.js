const PDFDocument = require('pdfkit');
const { query } = require('../config/database');

const vacacionesPdfController = {
  generatePdf: async (req, res, next) => {
    try {
      const result = await query(
        `SELECT sv.*, e.nombre_completo, e.cedula,
                e.posicion_cargo, d.nombre AS departamento
         FROM solicitudes_vacaciones sv
         JOIN empleados e ON sv.empleado_id = e.id
         LEFT JOIN departamentos d ON e.departamento_id = d.id
         WHERE sv.id = $1`, [req.params.id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Solicitud no encontrada' });
      }
      const s = result.rows[0];
      const doc = new PDFDocument({ size: 'letter', margin: 60 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition',
        `attachment; filename=vacaciones-${s.id}.pdf`);
      doc.pipe(res);

      doc.fontSize(16).font('Helvetica-Bold')
        .text('TOYOTACHIRA S.A.', { align: 'center' });
      doc.fontSize(11).font('Helvetica')
        .text('Solicitud de Vacaciones', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(60, doc.y).lineTo(552, doc.y).stroke();
      doc.moveDown(0.5);

      const info = [
        ['Empleado', s.nombre_completo],
        ['Cédula', s.cedula],
        ['Departamento', s.departamento],
        ['Cargo', s.posicion_cargo || 'N/A'],
        ['Fecha Salida', new Date(s.fecha_salida).toLocaleDateString('es-VE')],
        ['Fecha Regreso', new Date(s.fecha_regreso).toLocaleDateString('es-VE')],
        ['Días Solicitados', `${s.dias_solicitados}`],
        ['Estado', s.estado],
      ];
      doc.fontSize(10).font('Helvetica');
      for (const [label, val] of info) {
        doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(`${val}`);
      }
      if (s.motivo) {
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').text('Motivo: ');
        doc.font('Helvetica').text(s.motivo);
      }
      doc.moveDown(1.5);
      doc.fontSize(9)
        .text('Firma del empleado: _______________________')
        .text('Aprobado por: _______________________');
      doc.end();
    } catch (err) { next(err); }
  },
};

module.exports = vacacionesPdfController;
