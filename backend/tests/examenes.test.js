const request = require('supertest');
const app = require('./helpers/app');
const { getAuthHeader } = require('./helpers/db');

const H = getAuthHeader();
let examId = null;
let empId = null;

beforeAll(async () => {
  const res = await request(app).post('/api/empleados').set(H).send({
    nro: 7777, cedula: 'V-77.777.777', nombre_completo: 'Examen Test Emp',
    departamento_id: 1, fecha_ingreso: '2026-01-01', salario_base: 1000,
  });
  if (res.status === 201) empId = res.body.id;
});

afterAll(async () => {
  if (examId) await request(app).delete(`/api/examenes/${examId}`).set(H).catch(() => {});
  if (empId) await request(app).delete(`/api/empleados/${empId}`).set(H).catch(() => {});
});

describe('Examenes API', () => {
  it('debe listar reposos activos', async () => {
    const res = await request(app).get('/api/examenes/reposos-activos').set(H);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe rechazar sin token', async () => {
    const res = await request(app).get('/api/examenes/reposos-activos');
    expect(res.status).toBe(401);
  });

  it('debe listar exámenes del empleado', async () => {
    const res = await request(app).get(`/api/examenes/empleado/${empId}`).set(H);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe crear un examen médico', async () => {
    const res = await request(app).post('/api/examenes').set(H).send({
      empleado_id: empId, tipo_registro: 'Examen Ocupacional',
      diagnostico: 'Apto', medico_responsable: 'Dr. Test',
    });
    expect(res.status).toBe(201);
    expect(res.body.tipo_registro).toBe('Examen Ocupacional');
    examId = res.body.id;
  });

  it('debe crear un reposo médico', async () => {
    const res = await request(app).post('/api/examenes').set(H).send({
      empleado_id: empId, tipo_registro: 'Reposo Médico',
      fecha_inicio: '2026-08-01', diagnostico: 'Gripe',
    });
    expect(res.status).toBe(201);
  });

  it('debe rechazar campos requeridos', async () => {
    const res = await request(app).post('/api/examenes').set(H).send({});
    expect(res.status).toBe(400);
  });

  it('debe registrar reintegro', async () => {
    const res = await request(app).put(`/api/examenes/${examId}/reintegro`).set(H)
      .send({ fecha_reintegro: '2026-08-15' });
    expect(res.status).toBe(200);
    expect(res.body.fecha_reintegro).toBeTruthy();
  });

  it('debe retornar 404 reintegro inexistente', async () => {
    const res = await request(app).put('/api/examenes/99999/reintegro').set(H)
      .send({ fecha_reintegro: '2026-08-15' });
    expect(res.status).toBe(404);
  });

  it('debe actualizar examen', async () => {
    const res = await request(app).put(`/api/examenes/${examId}`).set(H)
      .send({ diagnostico: 'Apto - Actualizado' });
    expect(res.status).toBe(200);
    expect(res.body.diagnostico).toBe('Apto - Actualizado');
  });

  it('debe eliminar examen', async () => {
    const res = await request(app).delete(`/api/examenes/${examId}`).set(H);
    expect(res.status).toBe(200);
    examId = null;
  });

  it('debe retornar 404 al eliminar inexistente', async () => {
    const res = await request(app).delete('/api/examenes/99999').set(H);
    expect(res.status).toBe(404);
  });
});
