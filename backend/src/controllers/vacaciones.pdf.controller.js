const PDFDocument = require('pdfkit');

/**
 * Formatea fechas DD/MM/YYYY sin depender del huso horario del servidor:
 *  - string 'YYYY-MM-DD...' → usa las partes textuales (exacto)
 *  - Date a medianoche UTC (pg timestamptz / ISO 'Z') → partes UTC
 *  - Date a medianoche local (pg DATE) → partes locales
 */
const esDate = (d) => {
  if (!d) return '—';
  if (typeof d === 'string') {
    const m = d.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
    d = new Date(d);
  }
  const f = d instanceof Date ? d : new Date(d);
  const utcAligned = f.getTime() === Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate());
  const dd = utcAligned ? f.getUTCDate() : f.getDate();
  const mm = utcAligned ? f.getUTCMonth() : f.getMonth();
  const yy = utcAligned ? f.getUTCFullYear() : f.getFullYear();
  return `${String(dd).padStart(2, '0')}/${String(mm + 1).padStart(2, '0')}/${yy}`;
};

const vacacionesPdfController = {
  generatePdf: async (req, res, next) => {
    try {
      const { query } = require('../config/database');
      const result = await query(
        `SELECT sv.*, e.nombre_completo, e.cedula,
                e.posicion_cargo, e.fecha_ingreso, d.nombre AS departamento
         FROM solicitudes_vacaciones sv
         JOIN empleados e ON sv.empleado_id = e.id
         LEFT JOIN departamentos d ON e.departamento_id = d.id
         WHERE sv.id = $1`, [req.params.id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Solicitud no encontrada' });
      }
      const s = result.rows[0];

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition',
        `inline; filename=vacaciones-${s.id}.pdf`);

      const doc = new PDFDocument({ size: 'letter', margin: 60 });
      doc.pipe(res);

      const left = 60, right = 552, width = right - left;

      // ===== Encabezado =====
      doc.fontSize(16).font('Helvetica-Bold')
        .text('TOYOTACHIRA S.A.', left, 60, { align: 'center', width });
      doc.fontSize(10).font('Helvetica')
        .text('RIF. J-30133970-3', { align: 'center', width });
      doc.moveDown(0.3);
      doc.fontSize(13).font('Helvetica-Bold')
        .text('PLANILLA DE SOLICITUD DE VACACIONES', { align: 'center', width });
      doc.moveDown(0.4);

      const lineY = doc.y;
      doc.moveTo(left, lineY).lineTo(right, lineY).lineWidth(1).stroke();
      doc.moveDown(0.8);

      // ===== Datos del empleado =====
      const row = (label, value) => {
        const y = doc.y;
        doc.font('Helvetica-Bold').fontSize(10).text(`${label}:`, left, y, { continued: false });
        doc.font('Helvetica').text(String(value || '—'), left + 130, y);
        doc.moveTo(left, doc.y + 3).lineTo(right, doc.y + 3).lineWidth(0.5)
          .strokeColor('#CCCCCC').stroke();
        doc.moveDown(0.55);
      };

      row('Empleado', s.nombre_completo);
      row('Cédula', s.cedula);
      row('Departamento', s.departamento);
      row('Cargo', s.posicion_cargo);
      row('Fecha de Ingreso', esDate(s.fecha_ingreso));
      doc.moveDown(0.3);

      // ===== Datos de la solicitud =====
      doc.fontSize(11).font('Helvetica-Bold')
        .text('DATOS DE LA SOLICITUD', left, doc.y, { underline: true });
      doc.moveDown(0.5);

      row('Fecha de Salida', esDate(s.fecha_salida));
      row('Fecha de Regreso', esDate(s.fecha_regreso));
      row('Días Solicitados', String(s.dias_solicitados));
      row('Estado', s.estado);

      if (s.motivo) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(10).text('Motivo:', left, doc.y);
        doc.font('Helvetica').text(s.motivo, left, doc.y, { width, align: 'justify' });
      }

      // ===== Firmas (ancladas abajo de la página) =====
      const firmasY = 660;
      doc.moveTo(left, firmasY).lineTo(left + 180, firmasY).lineWidth(0.8).strokeColor('#000000').stroke();
      doc.fontSize(9).font('Helvetica')
        .text('Firma del Empleado', left, firmasY + 6, { width: 180, align: 'center' });

      doc.moveTo(right - 180, firmasY).lineTo(right, firmasY).stroke();
      doc.text('Aprobado por (RRHH)', right - 180, firmasY + 6, { width: 180, align: 'center' });

      doc.fontSize(8).fillColor('#888888')
        .text(`Documento generado el ${esDate(new Date())}`, left, 720, { width, align: 'center' });

      doc.end();
    } catch (err) { next(err); }
  },
};

module.exports = vacacionesPdfController;
