const request = require('supertest');
const app = require('./helpers/app');
const { getAuthHeader } = require('./helpers/db');

const headers = getAuthHeader();
let solicitudId = null;

describe('POST /api/vacaciones/periodos/calcular', () => {
  it('debe calcular días según Ley Orgánica', async () => {
    const res = await request(app)
      .post('/api/vacaciones/periodos/calcular')
      .set(headers)
      .send({ empleado_id: 1, anio_periodo: 2026 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('dias_acumulados');
    expect(res.body.dias_acumulados).toBeGreaterThanOrEqual(15);
  });

  it('debe rechazar sin empleado_id', async () => {
    const res = await request(app)
      .post('/api/vacaciones/periodos/calcular')
      .set(headers)
      .send({ anio_periodo: 2026 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/vacaciones/periodos/:empleadoId', () => {
  it('debe retornar períodos vacacionales del empleado', async () => {
    const res = await request(app)
      .get('/api/vacaciones/periodos/1')
      .set(headers);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/vacaciones/solicitudes', () => {
  it('debe crear una solicitud de vacaciones', async () => {
    const res = await request(app)
      .post('/api/vacaciones/solicitudes')
      .set(headers)
      .send({
        empleado_id: 1,
        fecha_salida: '2026-09-01',
        fecha_regreso: '2026-09-10',
        motivo: 'Vacaciones de prueba',
      });
    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('Solicitada');
    solicitudId = res.body.id;
  });

  it('debe rechazar sin campos requeridos', async () => {
    const res = await request(app)
      .post('/api/vacaciones/solicitudes')
      .set(headers)
      .send({ empleado_id: 1 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/vacaciones/solicitudes/pendientes', () => {
  it('debe listar solicitudes pendientes', async () => {
    const res = await request(app)
      .get('/api/vacaciones/solicitudes/pendientes')
      .set(headers);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('PUT /api/vacaciones/solicitudes/:id/aprobar', () => {
  it('debe aprobar la solicitud', async () => {
    const res = await request(app)
      .put(`/api/vacaciones/solicitudes/${solicitudId}/aprobar`)
      .set(headers);
    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('Aprobada');
  });
});

describe('DELETE /api/vacaciones/solicitudes/:id', () => {
  it('debe eliminar una solicitud', async () => {
    // Create one to delete
    const create = await request(app)
      .post('/api/vacaciones/solicitudes')
      .set(headers)
      .send({ empleado_id: 2, fecha_salida: '2026-10-01', fecha_regreso: '2026-10-05' });
    const res = await request(app)
      .delete(`/api/vacaciones/solicitudes/${create.body.id}`)
      .set(headers);
    expect(res.status).toBe(200);
  });
});
