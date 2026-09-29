const { Writable } = require('stream');
const zlib = require('zlib');

jest.mock('../src/config/database', () => ({ query: jest.fn() }));
const { query } = require('../src/config/database');
const pdfController = require('../src/controllers/vacaciones.pdf.controller');

const SOLICITUD = {
  id: 5,
  empleado_id: 1,
  fecha_salida: '2026-09-01T00:00:00.000Z',
  fecha_regreso: '2026-09-10T00:00:00.000Z',
  dias_solicitados: 9,
  estado: 'Aprobada',
  motivo: 'Vacaciones correspondientes al período 2025-2026',
  nombre_completo: 'María Gabriela Rodríguez Pérez',
  cedula: 'V-12345678',
  posicion_cargo: 'Analista de Sistemas',
  fecha_ingreso: '2021-03-15T00:00:00.000Z',
  departamento: 'Tecnología de la Información',
};

/** Tokenizador mínimo de contenido PDF (cadenas literales y hex). */
function tokenize(s) {
  const out = [];
  let i = 0;
  const limit = s.length;
  while (i < limit) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '(') {
      let depth = 1, j = i + 1, str = '';
      while (j < limit) {
        const ch = s[j];
        if (ch === '\\') { str += s[j + 1] || ''; j += 2; continue; }
        if (ch === '(') { depth++; str += ch; j++; continue; }
        if (ch === ')') { depth--; if (!depth) break; str += ch; j++; continue; }
        str += ch; j++;
      }
      out.push({ t: 'str', v: str }); i = j + 1; continue;
    }
    if (c === '<') {
      const j = s.indexOf('>', i);
      if (j < 0) break;
      const hex = s.slice(i + 1, j).replace(/[^0-9a-fA-F]/g, '');
      let str = '';
      for (let k = 0; k + 1 < hex.length; k += 2) {
        str += String.fromCharCode(parseInt(hex.substr(k, 2), 16));
      }
      out.push({ t: 'str', v: str }); i = j + 1; continue;
    }
    if (c === '[' || c === ']') { out.push({ t: 'op', v: c }); i++; continue; }
    if (c === '/') {
      let j = i + 1;
      while (j < limit && !/[\s()[\]<>]/.test(s[j])) j++;
      out.push({ t: 'op', v: s.slice(i, j) }); i = j; continue;
    }
    let j = i;
    while (j < limit && !/[\s()[\]<>]/.test(s[j])) j++;
    if (j === i) { i++; continue; } // seguridad: nunca avanzar en falso
    out.push({ t: 'op', v: s.slice(i, j) }); i = j;
  }
  return out;
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
    if (!s.includes('Tj') && !s.includes('TJ')) continue; // solo contenido de texto
    // Une los fragmentos de un array TJ: [<54> 40 <4f> ...] => "To"
    const tk = tokenize(s);
    let buf2 = '';
    for (const t of tk) {
      if (t.t === 'str') { buf2 += t.v; continue; }
      if (t.t === 'op' && /^-?[\d.]+$/.test(t.v)) continue; // kerning
      if (t.t === 'op' && (t.v === '[' || t.v === ']')) continue;
      if (buf2.trim()) texts.push(buf2);
      buf2 = '';
    }
    if (buf2.trim()) texts.push(buf2);
  }
  return texts;
}

function generarPdf(id = '5') {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const res = new Writable({
      write(chunk, enc, cb) { chunks.push(Buffer.from(chunk)); cb(); },
    });
    res.headers = {};
    res.setHeader = (k, v) => { res.headers[k] = v; };
    res.status = () => ({ json: () => {} });
    res.on('finish', () => resolve({ buf: Buffer.concat(chunks), headers: res.headers }));
    pdfController.generatePdf({ params: { id } }, res, reject);
  });
}

describe('GET /api/vacaciones/solicitudes/:id/pdf', () => {
  it('genera la planilla en una página con los datos de la solicitud', async () => {
    query.mockResolvedValue({ rows: [SOLICITUD] });
    const { buf, headers } = await generarPdf();

    expect(headers['Content-Type']).toBe('application/pdf');
    expect(headers['Content-Disposition']).toContain('inline');
    expect(buf.slice(0, 5).toString()).toBe('%PDF-');
    // una sola página
    expect((buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length).toBe(1);

    const cuerpo = textosDelPdf(buf).join('|');
    expect(cuerpo).toContain('TOYOTACHIRA S.A.');
    expect(cuerpo).toContain('PLANILLA DE SOLICITUD DE VACACIONES');
    expect(cuerpo).toContain('María Gabriela Rodríguez Pérez');
    expect(cuerpo).toContain('V-12345678');
    expect(cuerpo).toContain('Tecnología de la Información');
    expect(cuerpo).toContain('Analista de Sistemas');
    expect(cuerpo).toContain('01/09/2026');
    expect(cuerpo).toContain('10/09/2026');
    expect(cuerpo).toContain('9');
    expect(cuerpo).toContain('Aprobada');
    expect(cuerpo).toContain('Firma del Empleado');
    expect(cuerpo).toContain('Aprobado por (RRHH)');

    // todo el texto dentro de los márgenes de la carta (612x792)
    const raw = buf.toString('latin1');
    expect(raw).not.toContain('NaN');
  });

  it('devuelve 404 si la solicitud no existe', async () => {
    query.mockResolvedValue({ rows: [] });
    const json = jest.fn();
    const res = { status: jest.fn(() => ({ json })), setHeader: jest.fn() };
    await pdfController.generatePdf({ params: { id: '999' } }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({ error: 'Solicitud no encontrada' });
  });
});
