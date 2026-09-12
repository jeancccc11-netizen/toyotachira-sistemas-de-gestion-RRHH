const request = require('supertest');
const app = require('./helpers/app');
const { getAuthHeader } = require('./helpers/db');

const H = getAuthHeader();
let deptId = null;

describe('GET /api/departamentos', () => {
  it('debe listar departamentos', async () => {
    const res = await request(app).get('/api/departamentos').set(H);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  it('debe rechazar sin token', async () => {
    const res = await request(app).get('/api/departamentos');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/departamentos', () => {
  it('debe crear un departamento', async () => {
    const res = await request(app).post('/api/departamentos').set(H)
      .send({ nombre: 'Depto Test', descripcion: 'Descripción de prueba' });
    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Depto Test');
    deptId = res.body.id;
  });
  it('debe rechazar nombre duplicado', async () => {
    const res = await request(app).post('/api/departamentos').set(H)
      .send({ nombre: 'Depto Test' });
    expect(res.status).toBe(409);
  });
  it('debe rechazar sin nombre', async () => {
    const res = await request(app).post('/api/departamentos').set(H)
      .send({ descripcion: 'Sin nombre' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/departamentos/:id', () => {
  it('debe actualizar departamento', async () => {
    const res = await request(app).put(`/api/departamentos/${deptId}`).set(H)
      .send({ nombre: 'Depto Actualizado' });
    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Depto Actualizado');
  });
  it('debe retornar 404 para inexistente', async () => {
    const res = await request(app).put('/api/departamentos/99999').set(H)
      .send({ nombre: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/departamentos/:id', () => {
  it('debe eliminar departamento', async () => {
    const res = await request(app).delete(`/api/departamentos/${deptId}`).set(H);
    expect(res.status).toBe(200);
  });
  it('debe retornar 404 al eliminar inexistente', async () => {
    const res = await request(app).delete(`/api/departamentos/${deptId}`).set(H);
    expect(res.status).toBe(404);
  });
});
