const request = require('supertest');
const app = require('./helpers/app');
const { getAuthHeader } = require('./helpers/db');

const H = getAuthHeader();
let pid = null;

describe('POST /api/nomina/periodos', () => {
  it('debe crear un período quincenal', async () => {
    const res = await request(app).post('/api/nomina/periodos').set(H)
      .send({ quincena: 2, mes: 9, anio: 2026, fecha_inicio: '2026-09-16', fecha_fin: '2026-09-30', estatus: 'Borrador' });
    expect([201, 409]).toContain(res.status);
    if (res.status === 201) pid = res.body.id;
  });

  it('debe rechazar campos faltantes', async () => {
    const res = await request(app).post('/api/nomina/periodos').set(H).send({ quincena: 2 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/nomina/periodos', () => {
  it('debe listar períodos', async () => {
    const res = await request(app).get('/api/nomina/periodos').set(H);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (!pid && res.body.length) pid = res.body[0].id;
  });
});

describe('POST /api/nomina/:id/detalles', () => {
  it('debe agregar empleado a nómina', async () => {
    if (!pid) return;
    const res = await request(app).post(`/api/nomina/${pid}/detalles`).set(H)
      .send({ empleado_id: 1, sueldo_base: 4500, comision_mensual: 500, bonificacion: 200, deduccion_seguro_social: 315, deduccion_paro: 63, deduccion_inces: 31.5 });
    expect([200, 409]).toContain(res.status);
  });
});

describe('GET /api/nomina/:id/detalles', () => {
  it('debe listar detalles', async () => {
    if (!pid) return;
    const res = await request(app).get(`/api/nomina/${pid}/detalles`).set(H);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/nomina/:id/total', () => {
  it('debe calcular totales', async () => {
    if (!pid) return;
    const res = await request(app).get(`/api/nomina/${pid}/total`).set(H);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total_neto');
  });
});

describe('GET /api/nomina/:id/export/excel', () => {
  it('debe exportar Excel', async () => {
    if (!pid) return;
    const res = await request(app).get(`/api/nomina/${pid}/export/excel`).set(H);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('spreadsheetml');
  });
});

describe('GET /api/nomina/:id/recibo/:detalleId/pdf', () => {
  it('debe exportar PDF del recibo', async () => {
    if (!pid) return;
    const d = await request(app).get(`/api/nomina/${pid}/detalles`).set(H);
    const detId = d.body[0]?.id;
    if (!detId) return;
    const res = await request(app).get(`/api/nomina/${pid}/recibo/${detId}/pdf`).set(H);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('pdf');
  });
});

describe('DELETE /api/nomina/:id/detalles/:detalleId', () => {
  it('debe eliminar un detalle', async () => {
    if (!pid) return;
    const d = await request(app).get(`/api/nomina/${pid}/detalles`).set(H);
    const detId = d.body[0]?.id;
    if (!detId) return;
    const res = await request(app).delete(`/api/nomina/${pid}/detalles/${detId}`).set(H);
    expect(res.status).toBe(200);
  });
});

describe('DELETE /api/nomina/periodos/:id', () => {
  it('debe eliminar el período', async () => {
    if (!pid) return;
    const res = await request(app).delete(`/api/nomina/periodos/${pid}`).set(H);
    expect(res.status).toBe(200);
  });
});
