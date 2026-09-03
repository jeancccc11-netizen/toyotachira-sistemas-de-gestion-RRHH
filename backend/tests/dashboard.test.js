const request = require('supertest');
const app = require('./helpers/app');
const { getAuthHeader } = require('./helpers/db');

const headers = getAuthHeader();

describe('GET /api/dashboard', () => {
  it('debe retornar KPIs consolidados', async () => {
    const res = await request(app).get('/api/dashboard').set(headers);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('empleados');
    expect(res.body).toHaveProperty('solicitudes_pendientes');
    expect(res.body).toHaveProperty('reposos_activos');
    expect(res.body).toHaveProperty('polizas');
  });

  it('debe rechazar sin token', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/health', () => {
  it('debe retornar status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('SI-GHR API');
  });
});

describe('GET /api/departamentos', () => {
  it('debe listar departamentos', async () => {
    const res = await request(app).get('/api/departamentos').set(headers);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/examenes/reposos-activos', () => {
  it('debe listar reposos activos', async () => {
    const res = await request(app)
      .get('/api/examenes/reposos-activos')
      .set(headers);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
