const { Writable } = require('stream');
const zlib = require('zlib');

jest.mock('../src/config/database', () => ({ query: jest.fn() }));
const { query } = require('../src/config/database');
const pdfController = require('../src/controllers/nomina.pdf.controller');

const DETALLE = {
  id: 7,
  sueldo_base: '4500.00', comision_mensual: '675.00', bonificacion: '250.00',
  asignacion_vacaciones: '0.00', asignacion_bonos: '150.00', asignacion_extra: '0.00',
  deduccion_seguro_social: '180.00', deduccion_paro: '45.00',
  deduccion_inces: '22.50', deduccion_islr: '270.00', deduccion_urosalud: '150.00',
  deduccion_anticipos: '0.00', deduccion_otros: '0.00',
  total_asignaciones: '5575.00', total_deducciones: '667.50', neto_a_pagar: '4907.50',
  nombre_completo: 'María Gabriela Rodríguez Pérez',
  cedula: 'V-12345678',
  posicion_cargo: 'Analista de Sistemas',
  fecha_ingreso: '2021-03-15T00:00:00.000Z',
  departamento: 'Tecnología de la Información',
  fecha_inicio: '2026-09-01T00:00:00.000Z',
  fecha_fin: '2026-09-15T00:00:00.000Z',
};

/** Tokenizador mínimo de contenido PDF (cadenas, operadores, arrays TJ). */
function tokenize(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '(') {
      let depth = 1, j = i + 1, str = '';
      while (j < s.length) {
        const ch = s[j];
        if (ch === '\\') { str += s[j + 1]; j += 2; continue; }
        if (ch === '(') { depth++; str += ch; j++; continue; }
        if (ch === ')') { depth--; if (!depth) break; str += ch; j++; continue; }
        str += ch; j++;
      }
      out.push({ t: 'str', v: str }); i = j + 1; continue;
    }
    if (c === '[' || c === ']') { out.push({ t: c }); i++; continue; }
    if (c === '<') {
      const j = s.indexOf('>', i);
      const hex = s.slice(i + 1, j).replace(/[^0-9a-fA-F]/g, '');
      let str = '';
      for (let k = 0; k < hex.length; k += 2) str += String.fromCharCode(parseInt(hex.substr(k, 2), 16));
      out.push({ t: 'str', v: str }); i = j + 1; continue;
    }
    if (c === '/') {
      let j = i + 1;
      while (j < s.length && !/[\s\[\]()<>]/.test(s[j])) j++;
      out.push({ t: 'name', v: s.slice(i + 1, j) }); i = j; continue;
    }
    let j = i;
    while (j < s.length && !/[\s\[\]()<>]/.test(s[j])) j++;
    out.push({ t: 'op', v: s.slice(i, j) }); i = j;
  }
  return out;
}

function mul(m1, m2) {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + c1 * b2, b1 * a2 + d1 * b2,
    a1 * c2 + c1 * d2, b1 * c2 + d1 * d2,
    a1 * e2 + c1 * f2 + e1, b1 * e2 + d1 * f2 + f1,
  ];
}

function textosDelPdf(buf) {
  const raw = buf.toString('latin1');
  const re = /stream\r?\n/g;
  const texts = [];
  let m;
  while ((m = re.exec(raw))) {
    const start = m.index + m[0].length;
    const end = buf.indexOf('endstream', start);
    if (end < 0) break;
    re.lastIndex = end;
    let s;
    try { s = zlib.inflateSync(buf.slice(start, end)).toString('latin1'); } catch (e) { continue; }
    const tk = tokenize(s);
    // se sigue la transformación real del contenido (cm + q/Q) para obtener
    // las coordenadas finales en la página
    let ctm = [1, 0, 0, 1, 0, 0];
    const stack = [];
    let tm = [1, 0, 0, 1, 0, 0];
    for (let i = 0; i < tk.length; i++) {
      const t = tk[i];
      if (t.t !== 'op') continue;
      if (t.v === 'q') { stack.push(ctm.slice()); continue; }
      if (t.v === 'Q') { if (stack.length) ctm = stack.pop(); continue; }
      if (t.v === 'cm') {
        const mm = tk.slice(i - 6, i).map((x) => Number(x.v));
        if (mm.every((n) => Number.isFinite(n))) ctm = mul(ctm, mm);
        continue;
      }
      if (t.v === 'Tm') {
        const mm = tk.slice(i - 6, i).map((x) => Number(x.v));
        if (mm.every((n) => Number.isFinite(n))) tm = mm;
        continue;
      }
      if (t.v === 'Tj' || t.v === 'TJ' || t.v === "'" || t.v === '"') {
        let str = '';
        for (let k = i - 1; k >= 0; k--) {
          if (tk[k].t === 'str') { str = tk[k].v + str; continue; }
          if (tk[k].t === '[' || tk[k].t === ']') continue;
          if (tk[k].t === 'op' && /^-?[\d.]+$/.test(tk[k].v)) continue;
          break;
        }
        // origen del texto llevado a coordenadas de página (yTop = 792 - y)
        const [a, b, c, d, e, f] = ctm;
        const x = a * tm[4] + c * tm[5] + e;
        const y = b * tm[4] + d * tm[5] + f;
        texts.push({ x, y: 792 - y, text: str });
      }
    }
  }
  return texts;
}

function generarPdf() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const res = new Writable({
      write(chunk, enc, cb) { chunks.push(Buffer.from(chunk)); cb(); },
    });
    res.headers = {};
    res.setHeader = (k, v) => { res.headers[k] = v; };
    res.status = () => ({ json: () => {} });
    res.on('finish', () => resolve({ buf: Buffer.concat(chunks), headers: res.headers }));
    pdfController.pdf({ params: { detalleId: '7' } }, res, reject);
  });
}

describe('GET /api/nomina/:id/recibo/:detalleId/pdf', () => {
  it('genera un recibo de una página con el diseño de la planilla', async () => {
    query.mockResolvedValue({ rows: [DETALLE] });
    const { buf, headers } = await generarPdf();

    expect(headers['Content-Type']).toBe('application/pdf');
    expect(buf.slice(0, 5).toString()).toBe('%PDF-');
    expect((buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length).toBe(1);

    const texts = textosDelPdf(buf);
    const cuerpo = texts.map((t) => t.text).join('|');
    expect(cuerpo).toContain('RECIBO DE PAGO NOMINA');
    expect(cuerpo).toContain('RIF. J-30133970-3');
    expect(cuerpo).toContain('DOMICILIO');
    expect(cuerpo).toContain('María Gabriela Rodríguez Pérez');
    expect(cuerpo).toContain('V-12345678');
    expect(cuerpo).toContain('NETO A PAGAR');
    expect(cuerpo).toContain('RECIBI CONFORME:');
    expect(cuerpo).toContain('4.907,50');   // neto a pagar
    expect(cuerpo).toContain('5.575,00');   // total asignaciones
    expect(cuerpo).toContain('667,50');     // total deducciones
    expect(cuerpo).toContain('DEL: 01/09/2026  AL: 15/09/2026');

    // todo el contenido queda dentro de los márgenes de la página
    for (const t of texts) {
      expect(t.x).toBeGreaterThanOrEqual(30);
      expect(t.x).toBeLessThanOrEqual(582);
      expect(t.y).toBeGreaterThanOrEqual(30);
      expect(t.y).toBeLessThanOrEqual(762);
    }

    // el logotipo se incrusta como imagen
    expect(buf.toString('latin1')).toMatch(/\/Subtype\s*\/Image/);
  });

  it('devuelve 404 si el detalle no existe', async () => {
    query.mockResolvedValue({ rows: [] });
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })), setHeader: jest.fn() };
    await pdfController.pdf({ params: { detalleId: '999' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: 'Detalle no encontrado' });
  });
});
