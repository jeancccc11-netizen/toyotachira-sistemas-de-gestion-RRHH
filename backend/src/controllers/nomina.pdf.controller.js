const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { query } = require('../config/database');

/**
 * Recibo de pago de nómina (PDF).
 *
 * Replica el diseño de la planilla `scripts/recibo nomina.xlsx`
 * (hoja "EJEMPLO", área de impresión A1:H42): banda superior con logotipo y RIF,
 * bloque de DOMICILIO FISCAL, título en banda gris, datos del empleado
 * (nombre, C.I., fecha de ingreso, período, cargo, departamento, salario base
 * diario y cuenta), tabla de asignaciones / deducciones con sus totales,
 * NETO A PAGAR con doble subrayado, texto de recepción y bloque de firma.
 *
 * Colores y medidas tomados del propio archivo Excel:
 *  - gris etiquetas  #D9D9D9 (Blanco, Fondo 1, Oscuro 15%)
 *  - gris encabezados #AEAAAA (Blanco, Fondo 2, Oscuro 25%)
 *  - bordes "medium" negros, tipografía Arial 10 (Helvetica en PDF)
 */

const LOGO = path.join(__dirname, '../assets/logo-toyotachira.png');

const PAGE_W = 612;
const PAGE_H = 792;
const M = 40; // margen
const CW = PAGE_W - M * 2; // ancho útil: 532 pt
const CH = PAGE_H - M * 2; // alto útil: 712 pt

const INK = '#000000';
const GRAY_LABEL = '#D9D9D9';
const GRAY_HEAD = '#AEAAAA';
const BW = 1.7; // borde "medium" (natural; al escalarse queda igual que en la hoja)
const DBW = 1.05; // línea del borde doble
const F = 'Helvetica';
const FB = 'Helvetica-Bold';

// Anchos de columna de la hoja (Excel: px = caracteres * 7.4133 + 5)
const COL_CHARS = [
  18.42578125, 12.7109375, 12.7109375, 11.5703125,
  11.42578125, 13.42578125, 13.42578125, 18,
];
const natW = COL_CHARS.map((c) => Math.round(c * 7.4133 + 5) * 0.75);
// Coordenadas "naturales" de la hoja: se dibuja todo a tamaño natural y luego
// se aplica UNA sola escala (igual que hace Excel al ajustar a la página), de
// modo que columnas, filas, tipografía y bordes conservan sus proporciones.
const CW_NAT = natW.reduce((a, b) => a + b, 0); // ~651 pt
const COLW = natW.slice();
const COLX = [];
{
  let x = M;
  for (const w of COLW) { COLX.push(x); x += w; }
}
const cEnd = (i) => COLX[i] + COLW[i];
const area = (a, b) => ({ x: COLX[a], w: cEnd(b) - COLX[a] });

// Alturas de fila de la hoja (pt). 12.75 = altura por defecto de la hoja.
const BASE_H = 12.75;
const ROW_H = [0,
  12.75, 12.75, 12.75, 25.5, 15, 15.75, 7.5, 13.5, 12.75, 19.5,
  23.25, 25.5, 7.5, 26.25, 18, 15.75, 15, 17.25, 15, 15,
  15, 15, 11.25, 13.5, 12.75, 14.25, 14.25, 14.25, 13.5, 12.75,
  6.75, 8.25, 13.5, 12.75, 18, 18, 14.25, 45, 16.5, 19.5,
  13.5, 29.25];

// Filas con conceptos: necesitan alto mínimo para el texto (10 pt).
for (let r = 16; r <= 23; r++) ROW_H[r] = Math.max(ROW_H[r], BASE_H);
for (let r = 25; r <= 32; r++) ROW_H[r] = Math.max(ROW_H[r], BASE_H);

// Red de seguridad: si por algún motivo las filas exceden el alto útil, se
// reducen proporcionalmente (la escala uniforme de abajo ya se encarga normalmente).
let CH_NAT = 0;
for (let r = 1; r <= 42; r++) CH_NAT += ROW_H[r];

// Escala uniforme + centrado vertical de la hoja dentro del marco de la página.
const S = Math.min(CW / CW_NAT, CH / CH_NAT);
const DY = (PAGE_H - CH_NAT * S) / 2 - M;

// Posiciones verticales
const ROW_Y = [0];
for (let r = 1; r <= 42; r++) ROW_Y[r] = M + ROW_H.slice(1, r).reduce((a, b) => a + b, 0);
const yEnd = (r) => ROW_Y[r] + ROW_H[r];

const num = (v) => {
  const n = parseFloat(v || 0);
  const [i, d] = Math.abs(n).toFixed(2).split('.');
  return (n < 0 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + d;
};
const fdate = (v) => {
  if (!v) return '';
  if (!(v instanceof Date)) {
    // 'YYYY-MM-DD...' sin zona horaria: se toma tal cual para no correr un día
    const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  }
  const d = v instanceof Date ? v : new Date(v);
  if (isNaN(d.getTime())) return String(v).slice(0, 10);
  const p = (x) => String(x).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
};
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
  'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const nominaPdfController = {
  pdf: async (req, res, next) => {
    try {
      const result = await query(
        `SELECT dn.*,
                e.nombre_completo, e.cedula, e.posicion_cargo, e.fecha_ingreso,
                dep.nombre AS departamento,
                p.quincena, p.mes, p.anio, p.fecha_inicio, p.fecha_fin
         FROM detalles_nomina dn
         JOIN empleados e ON dn.empleado_id = e.id
         LEFT JOIN departamentos dep ON e.departamento_id = dep.id
         LEFT JOIN periodos_nomina p ON dn.nomina_id = p.id
         WHERE dn.id = $1`,
        [req.params.detalleId]
      );
      if (!result.rows.length) {
        return res.status(404).json({ error: 'Detalle no encontrado' });
      }
      const d = result.rows[0];

      const ini = d.fecha_inicio ? new Date(d.fecha_inicio) : null;
      const fin = d.fecha_fin ? new Date(d.fecha_fin) : null;
      const dias = ini && fin && !isNaN(ini) && !isNaN(fin)
        ? Math.round((fin - ini) / 86400000) + 1
        : 0;
      const diario = dias > 0 ? parseFloat(d.sueldo_base || 0) / dias : 0;

      const asignaciones = [
        { label: 'SUELDO BASE', dias, bsDia: diario, total: d.sueldo_base },
        { label: 'COMISION MENSUAL', total: d.comision_mensual },
        { label: 'BONIFICACION', total: d.bonificacion },
        { label: 'VACACIONES', total: d.asignacion_vacaciones },
        { label: 'BONOS', total: d.asignacion_bonos },
        { label: 'HORAS EXTRAS', total: d.asignacion_extra },
      ];
      const deducciones = [
        ['SEGURO SOCIAL OBLIGATORIO', d.deduccion_seguro_social],
        ['REGIMEN PRESTACIONAL DE EMPLEO (PARO)', d.deduccion_paro],
        ['INCES', d.deduccion_inces],
        ['RET ISLR', d.deduccion_islr],
        ['UROSALUD', d.deduccion_urosalud],
        ['ANTICIPOS', d.deduccion_anticipos],
        ['OTRAS DEDUCCIONES', d.deduccion_otros],
      ];
      const hoy = new Date();
      const periodo = dias > 0
        ? `DEL: ${fdate(d.fecha_inicio)}  AL: ${fdate(d.fecha_fin)}`
        : 'DEL:      AL:';
      const recepcion = `He recibido la cantidad de Bs ${num(d.neto_a_pagar)}, ` +
        'correspondiente a mi salario del periodo comprendido en este recibo ' +
        'de pago de salario. En San Cristóbal a los ' +
        `${hoy.getDate()} dias del mes de ${MESES[hoy.getMonth()]} de ${hoy.getFullYear()}.`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition',
        `attachment; filename=recibo-${d.id}.pdf`);

      const doc = new PDFDocument({ size: 'letter', margin: M, info: {
        Title: `Recibo de nómina - ${d.nombre_completo || d.id}`,
        Author: 'Toyotachira S.A.',
      } });
      doc.pipe(res);

      // Todo el dibujo usa coordenadas naturales de la hoja; una sola escala
      // uniforme los lleva al papel (igual que "ajustar a página" en Excel).
      doc.translate(0, DY);
      doc.scale(S, { origin: [M, M] });

      // ---------- helpers de dibujo ----------
      const fillBox = (x, y, w, h, color) => {
        if (w <= 0 || h <= 0) return;
        doc.save().fillColor(color).rect(x, y, w, h).fill().restore();
      };
      const hline = (x1, x2, y, w = BW) =>
        fillBox(x1, y - w / 2, x2 - x1, w, INK);
      const vline = (x, y1, y2, w = BW) =>
        fillBox(x - w / 2, y1, w, y2 - y1, INK);
      const dbl = (x1, x2, y) => {
        fillBox(x1, y - 1.5, x2 - x1, DBW, INK);
        fillBox(x1, y + 0.45, x2 - x1, DBW, INK);
      };
      const txt = (str, box, o = {}) => {
        const s = str === undefined || str === null ? '' : String(str);
        if (!s.trim()) return;
        const size0 = o.size || 10;
        const pad = o.pad === undefined ? 3 : o.pad;
        const w = Math.max(6, box.w - pad * 2);
        const maxH = o.maxH || box.h;
        let size = size0;
        const font = () => doc.font(o.bold ? FB : F).fontSize(size);
        font();
        let th = doc.heightOfString(s, { width: w });
        while (th > maxH && size > 5) {
          size -= 0.5;
          font();
          th = doc.heightOfString(s, { width: w });
        }
        const y0 = box.y + Math.max(0, (box.h - th) / 2);
        // Centrado según la altura visible (mayúsculas → base del glifo), como
        // hace Excel: si no, en las filas de banda las letras rozan el borde.
        const f = doc._font || {};
        const em = (v, def) => ((typeof v === 'number' ? v : def) / 1000) * size;
        const asc = em(f.ascender, 718);
        const desc = em(f.descender, -207);
        const gap = em(f.lineGap, 0);
        const cap = em(f.capHeight, f.ascender || 718);
        const perLine = asc - desc + gap;
        const n = Math.max(1, Math.round(th / Math.max(0.01, perLine)));
        const block = (n - 1) * perLine + cap - desc;
        const y = box.y + Math.max(0, (box.h - block) / 2) - asc + cap;
        void y0;
        doc.fillColor(INK).text(s, box.x + pad, y, {
          width: w, align: o.align || 'left', lineGap: 0,
        });
      };
      const cellBox = (a, b, r) => ({ x: area(a, b).x, w: area(a, b).w, y: ROW_Y[r], h: ROW_H[r] });

      // ---------- 1. banda superior gris (filas 1-4) con logotipo ----------
      fillBox(M, ROW_Y[1], CW_NAT, yEnd(4) - ROW_Y[1], GRAY_LABEL);
      if (fs.existsSync(LOGO)) {
        try { doc.image(LOGO, M + 2, ROW_Y[1] + 6, { width: 279.4, height: 37.5 }); }
        catch (e) { /* sin logotipo */ }
      }
      txt('RIF. J-30133970-3', { x: M, w: CW_NAT, y: ROW_Y[4], h: ROW_H[4] },
        { bold: true });

      // ---------- 2. DOMICILIO FISCAL (filas 5-6) ----------
      fillBox(COLX[0], ROW_Y[5], COLW[0], yEnd(6) - ROW_Y[5], GRAY_LABEL);
      txt('DOMICILIO FISCAL:', cellBox(0, 0, 5), { bold: true, align: 'center', maxH: yEnd(6) - ROW_Y[5] });
      txt('Av. 19 de Abril con esquina calle 9 edif. Centro Empresarial ' +
        'Toyotáchira nivel piso pb of pb Urb. Pirineos San Cristóbal Táchira ' +
        'zona postal 5001.',
        { x: cEnd(0), w: CW_NAT - COLW[0], y: ROW_Y[5], h: yEnd(6) - ROW_Y[5] },
        { maxH: yEnd(6) - ROW_Y[5] });

      // ---------- 3. título (fila 8) ----------
      fillBox(M, ROW_Y[8], CW_NAT, ROW_H[8], GRAY_HEAD);
      txt('RECIBO DE PAGO NOMINA',
        { x: M, w: CW_NAT, y: ROW_Y[8], h: ROW_H[8] }, { bold: true, align: 'center' });

      // ---------- 4. datos del empleado (filas 9-12) ----------
      const grayRows = [9, 10, 11, 12];
      for (const r of grayRows) fillBox(COLX[0], ROW_Y[r], COLW[0], ROW_H[r], GRAY_LABEL);
      fillBox(COLX[4], ROW_Y[9], cEnd(7) - COLX[4], ROW_H[9], GRAY_LABEL);
      fillBox(COLX[4], ROW_Y[11], COLW[4] + COLW[5], ROW_H[11], GRAY_LABEL);
      fillBox(COLX[4], ROW_Y[12], COLW[4] + COLW[5], ROW_H[12], GRAY_LABEL);
      fillBox(COLX[2], ROW_Y[12], COLW[2] + COLW[3], ROW_H[12], GRAY_HEAD);

      txt('NOMBRE:', cellBox(0, 0, 9), { bold: true, align: 'center' });
      txt(d.nombre_completo, cellBox(1, 3, 9), { bold: true, align: 'center' });
      txt('FECHA DE INGRESO', cellBox(4, 5, 9), { bold: true });
      txt('PERIODO:', cellBox(6, 7, 9), { bold: true, align: 'center' });

      txt('C.I.', cellBox(0, 0, 10), { bold: true, align: 'center' });
      txt(d.cedula, cellBox(1, 3, 10), { bold: true, align: 'center' });
      txt(fdate(d.fecha_ingreso), cellBox(4, 5, 10), { bold: true, align: 'right' });
      txt(periodo, cellBox(6, 7, 10), { bold: true, align: 'center' });

      txt('CARGO', cellBox(0, 0, 11), { bold: true, align: 'center' });
      txt(d.posicion_cargo, cellBox(1, 3, 11), { bold: true, align: 'center' });
      txt('DEPARTAMENTO', cellBox(4, 5, 11), { bold: true, align: 'center' });
      txt(d.departamento, cellBox(6, 7, 11), { bold: true, align: 'center' });

      txt('SALARIO BASE DIARIO', cellBox(0, 0, 12), { bold: true, align: 'center' });
      txt(dias > 0 ? num(diario) : '', cellBox(1, 1, 12), { bold: true, align: 'center' });
      txt('N°DE CUENTA A DEPOSITAR', cellBox(4, 5, 12), { bold: true, align: 'center' });

      // ---------- 5. encabezado de tabla (fila 14) ----------
      fillBox(M, ROW_Y[14], CW_NAT, ROW_H[14], GRAY_HEAD);
      txt('CONCEPTO', cellBox(0, 2, 14), { bold: true });
      txt('DIAS', cellBox(3, 3, 14), { bold: true, align: 'center' });
      txt('HORA EXTRA/DIA', cellBox(4, 4, 14), { bold: true, align: 'center' });
      txt('Bs. DIA', cellBox(5, 5, 14), { bold: true, align: 'center' });
      txt('TOTAL BSS', cellBox(7, 7, 14), { bold: true, align: 'center' });

      // ---------- 6. ASIGNACIONES (fila 15 y conceptos 16-23) ----------
      txt('ASIGNACIONES', cellBox(0, 2, 15), { bold: true });
      asignaciones.forEach((a, i) => {
        const r = 16 + i;
        if (r > 23) return;
        txt(a.label, cellBox(0, 2, r));
        if (a.dias) txt(String(a.dias), cellBox(3, 3, r), { align: 'center' });
        if (a.bsDia) txt(num(a.bsDia), cellBox(5, 5, r));
        txt(num(a.total), cellBox(7, 7, r), { align: 'right', pad: 5 });
      });

      // ---------- 7. banda TOTAL ASIGNACIONES / DEDUCCIONES (fila 24) ----------
      fillBox(M, ROW_Y[24], CW_NAT, ROW_H[24], GRAY_HEAD);
      txt('DEDUCCIONES', cellBox(0, 2, 24), { bold: true });
      txt('TOTAL ASIGNACIONES', cellBox(3, 5, 24), { bold: true, align: 'center' });
      txt('Bs.', cellBox(6, 6, 24), { bold: true, align: 'center' });
      txt(num(d.total_asignaciones), cellBox(7, 7, 24), { bold: true, align: 'right', pad: 5 });

      // ---------- 8. DEDUCCIONES (filas 25-32) ----------
      deducciones.forEach(([label, val], i) => {
        const r = 25 + i;
        if (r > 32) return;
        txt(label, cellBox(0, 5, r));
        txt('Bs.', cellBox(6, 6, r), { bold: true, align: 'center' });
        txt(num(val), cellBox(7, 7, r), { align: 'right', pad: 5 });
        dbl(COLX[6], cEnd(6), yEnd(r)); // subrayado doble bajo "Bs."
      });

      // ---------- 9. banda TOTAL DEDUCCIONES (fila 33) ----------
      fillBox(M, ROW_Y[33], CW_NAT, ROW_H[33], GRAY_HEAD);
      txt('TOTAL DEDUCCIONES.', cellBox(3, 5, 33), { bold: true, align: 'center' });
      txt('Bs.', cellBox(6, 6, 33), { bold: true, align: 'center' });
      txt(num(d.total_deducciones), cellBox(7, 7, 33), { bold: true, align: 'right', pad: 5 });

      // ---------- 10. NETO A PAGAR (fila 35) ----------
      txt('NETO A PAGAR', cellBox(3, 4, 35), { bold: true, align: 'center' });
      txt('Bs.', cellBox(6, 6, 35), { bold: true, align: 'center' });
      txt(num(d.neto_a_pagar), cellBox(7, 7, 35), { bold: true, align: 'right', pad: 5 });
      dbl(COLX[3], cEnd(4), yEnd(35));
      dbl(COLX[6], M + CW_NAT, yEnd(35));

      // ---------- 11. texto de recepción y firmas (filas 38-42) ----------
      txt(recepcion, { x: M, w: CW_NAT, y: ROW_Y[38], h: ROW_H[38] },
        { maxH: ROW_H[38] });
      // la hoja lo centra en la columna A; aquí se reduce un punto para que
      // el texto quepa dentro del marco (las columnas van comprimidas)
      txt('RECIBI CONFORME:', cellBox(0, 0, 40), { align: 'center' });
      txt('C.I.', cellBox(1, 1, 41));

      // ---------- 12. líneas y marco ----------
      const L = M;
      const R = M + CW_NAT;
      hline(L, R, ROW_Y[1]);           // marco superior
      hline(L, R, yEnd(4));
      hline(L, R, yEnd(6));
      hline(L, R, yEnd(7));
      hline(L, R, yEnd(8));
      hline(L, R, yEnd(9));
      hline(L, R, yEnd(10));
      hline(L, R, yEnd(11));
      hline(L, R, yEnd(12));
      hline(L, R, yEnd(13));
      hline(L, R, yEnd(14));
      hline(L, R, ROW_Y[24]);
      hline(L, R, yEnd(24));
      hline(L, R, ROW_Y[33]);
      hline(L, R, yEnd(33));
      hline(COLX[1], cEnd(1), yEnd(40));   // línea de firma corta
      hline(COLX[1], cEnd(3), yEnd(41));   // línea de firma
      hline(L, R, yEnd(42));               // marco inferior

      vline(L, ROW_Y[1], yEnd(42));        // marco izquierdo
      vline(R, ROW_Y[1], yEnd(42));        // marco derecho
      vline(cEnd(0), ROW_Y[5], yEnd(6));
      vline(cEnd(0), ROW_Y[9], yEnd(12));
      vline(cEnd(3), ROW_Y[9], yEnd(12));
      vline(cEnd(5), ROW_Y[9], yEnd(12));
      vline(cEnd(1), ROW_Y[12], yEnd(12));

      doc.end();
    } catch (err) { next(err); }
  },
};

module.exports = nominaPdfController;
