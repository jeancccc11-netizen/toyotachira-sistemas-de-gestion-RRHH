const request = require('supertest');
const app = require('./helpers/app');
const { getAuthHeader } = require('./helpers/db');

const H = getAuthHeader();
let pid = null;

describe('POST /api/urosalud/polizas', () => {
  it('debe crear una póliza', async () => {
    const res = await request(app).post('/api/urosalud/polizas').set(H)
      .send({ empleado_id: 2, fecha_afiliacion: '2026-08-01', plan_contratado: 'Plan Plus', monto_prima: 120, asesor: 'Test' });
    expect(res.status).toBe(201);
    expect(res.body.plan_contratado).toBe('Plan Plus');
    pid = res.body.id;
  });
  it('debe rechazar campos requeridos', async () => {
    const res = await request(app).post('/api/urosalud/polizas').set(H).send({ empleado_id: 1 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/urosalud/polizas', () => {
  it('debe listar pólizas', async () => {
    const res = await request(app).get('/api/urosalud/polizas').set(H);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/urosalud/polizas/resumen', () => {
  it('debe retornar resumen por plan', async () => {
    const res = await request(app).get('/api/urosalud/polizas/resumen').set(H);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/urosalud/cargas', () => {
  it('debe agregar carga familiar', async () => {
    const res = await request(app).post('/api/urosalud/cargas').set(H)
      .send({ poliza_id: pid, nombre_completo: 'María Prueba', parentesco: 'Cónyuge', sexo: 'F' });
    expect(res.status).toBe(201);
  });
});

describe('GET /api/urosalud/cargas/:polizaId', () => {
  it('debe listar cargas de la póliza', async () => {
    const res = await request(app).get(`/api/urosalud/cargas/${pid}`).set(H);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('DELETE /api/urosalud/cargas/:id', () => {
  it('debe eliminar una carga', async () => {
    const c = await request(app).get(`/api/urosalud/cargas/${pid}`).set(H);
    const cid = c.body[0]?.id;
    if (!cid) return;
    const res = await request(app).delete(`/api/urosalud/cargas/${cid}`).set(H);
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/urosalud/polizas/:id', () => {
  it('debe eliminar la póliza', async () => {
    const res = await request(app).delete(`/api/urosalud/polizas/${pid}`).set(H);
    expect(res.status).toBe(200);
  });
});
