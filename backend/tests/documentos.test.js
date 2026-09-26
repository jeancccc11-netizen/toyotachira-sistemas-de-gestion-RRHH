const request = require('supertest');
const app = require('./helpers/app');
const { getAuthHeader } = require('./helpers/db');

const H = getAuthHeader();
let docId = null;
let testEmpId = null;

beforeAll(async () => {
  const res = await request(app).post('/api/empleados').set(H).send({
    nro: 8888, cedula: 'V-88.888.888', nombre_completo: 'Docs Test Emp',
    departamento_id: 1, fecha_ingreso: '2026-01-01', salario_base: 1000,
  });
  if (res.status === 201) testEmpId = res.body.id;
});

afterAll(async () => {
  if (testEmpId) await request(app).delete(`/api/empleados/${testEmpId}`).set(H).catch(() => {});
});

describe('Documentos API', () => {
  it('debe listar documentos del empleado', async () => {
    const res = await request(app).get(`/api/documentos/empleado/${testEmpId}`).set(H);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe rechazar sin token', async () => {
    const res = await request(app).get(`/api/documentos/empleado/${testEmpId}`);
    expect(res.status).toBe(401);
  });

  it('debe retornar stats', async () => {
    const res = await request(app).get('/api/documentos/stats').set(H);
    expect(res.status).toBe(200);
  });

  it('debe subir un documento', async () => {
    const buf = Buffer.from('Documento de prueba');
    const res = await request(app).post('/api/documentos/upload').set(H)
      .field('empleado_id', String(testEmpId))
      .field('tipo_documento', 'Otros')
      .attach('archivo', buf, 'test.pdf');
    expect(res.status).toBe(201);
    expect(res.body.nombre_archivo).toBeTruthy();
    docId = res.body.id;
  });

  it('debe listar carpetas (maneja columna ausente)', async () => {
    const res = await request(app).get(`/api/documentos/folders/${testEmpId}`).set(H);
    expect(res.status).toBe(200);
  });

  it('debe eliminar documento', async () => {
    const res = await request(app).delete(`/api/documentos/${docId}`).set(H);
    expect(res.status).toBe(200);
  });

  it('debe retornar 404 al eliminar inexistente', async () => {
    const res = await request(app).delete(`/api/documentos/${docId}`).set(H);
    expect(res.status).toBe(404);
  });
});

describe('GET /uploads (protección de archivos estáticos)', () => {
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.resolve('./uploads');
  const testFile = path.join(uploadDir, '_test_static.txt');

  beforeAll(() => {
    fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(testFile, 'contenido de prueba');
  });
  afterAll(() => { try { fs.unlinkSync(testFile); } catch { /* noop */ } });

  it('rechaza sin token', async () => {
    const res = await request(app).get('/uploads/_test_static.txt');
    expect(res.status).toBe(401);
  });

  it('rechaza con token inválido', async () => {
    const res = await request(app).get('/uploads/_test_static.txt?token=invalido');
    expect(res.status).toBe(401);
  });

  it('sirve el archivo con token válido (query o header)', async () => {
    const conQuery = await request(app).get(`/uploads/_test_static.txt?token=${H.Authorization.split(' ')[1]}`);
    expect(conQuery.status).toBe(200);
    expect(conQuery.text).toContain('contenido de prueba');

    const conHeader = await request(app).get('/uploads/_test_static.txt').set(H);
    expect(conHeader.status).toBe(200);
  });

  it('bloquea path traversal', async () => {
    const token = H.Authorization.split(' ')[1];
    const res = await request(app).get(`/uploads/..%2F..%2Fpackage.json?token=${token}`);
    expect([403, 404]).toContain(res.status);
  });
});
