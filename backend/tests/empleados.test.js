const request = require('supertest');
const app = require('./helpers/app');
const { getAuthHeader } = require('./helpers/db');

const H = getAuthHeader();
let cid = null;

describe('GET /api/empleados', () => {
  it('debe listar empleados autenticado', async () => {
    const res = await request(app).get('/api/empleados').set(H);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  it('debe rechazar sin token', async () => {
    const res = await request(app).get('/api/empleados');
    expect(res.status).toBe(401);
  });
  it('debe filtrar por estado', async () => {
    const res = await request(app).get('/api/empleados?estado_operativo=Activo').set(H);
    expect(res.status).toBe(200);
    res.body.forEach((e) => expect(e.estado_operativo).toBe('Activo'));
  });
});

describe('GET /api/empleados/stats', () => {
  it('debe retornar estadísticas', async () => {
    const res = await request(app).get('/api/empleados/stats').set(H);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
  });
});

describe('POST /api/empleados', () => {
  it('debe crear un empleado', async () => {
    const res = await request(app).post('/api/empleados').set(H).send({
      nro: 9999, cedula: 'V-99.999.999', nombre_completo: 'Empleado Prueba',
      departamento_id: 1, fecha_ingreso: '2026-01-15', salario_base: 1500, estado_operativo: 'Activo',
    });
    expect(res.status).toBe(201);
    cid = res.body.id;
  });
  it('debe rechazar campos requeridos', async () => {
    const res = await request(app).post('/api/empleados').set(H).send({ nombre_completo: 'X' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/empleados/:id', () => {
  it('debe retornar empleado específico', async () => {
    const res = await request(app).get(`/api/empleados/${cid}`).set(H);
    expect(res.status).toBe(200);
    expect(res.body.nombre_completo).toBe('Empleado Prueba');
  });
  it('debe retornar 404 para inexistente', async () => {
    const res = await request(app).get('/api/empleados/99999').set(H);
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/empleados/:id', () => {
  it('debe actualizar empleado', async () => {
    const res = await request(app).put(`/api/empleados/${cid}`).set(H)
      .send({ nombre_completo: 'Actualizado', salario_base: 2000 });
    expect(res.status).toBe(200);
    expect(res.body.nombre_completo).toBe('Actualizado');
  });
});

describe('DELETE /api/empleados/:id', () => {
  it('debe eliminar empleado', async () => {
    const res = await request(app).delete(`/api/empleados/${cid}`).set(H);
    expect(res.status).toBe(200);
  });
  it('debe retornar 404 al eliminar inexistente', async () => {
    const res = await request(app).delete(`/api/empleados/${cid}`).set(H);
    expect(res.status).toBe(404);
  });
});
