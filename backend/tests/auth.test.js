const request = require('supertest');
const app = require('./helpers/app');
const { getAuthHeader, seedTestData, cleanupTestUser } = require('./helpers/db');

beforeAll(async () => { await seedTestData(); });
afterAll(async () => { await cleanupTestUser(); });

describe('POST /api/auth/login', () => {
  it('debe retornar token JWT con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });

  it('debe rechazar credenciales inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('debe rechazar campos vacíos', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: '', password: '' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/register (requiere admin)', () => {
  it('debe crear usuario con token de admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set(getAuthHeader())
      .send({ username: 'test_reg_user', password: 'pass123', rol: 'consulta' });
    expect([201, 409]).toContain(res.status);
  });

  it('debe rechazar sin token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'x', password: 'y' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/profile', () => {
  it('debe retornar perfil con token válido', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set(getAuthHeader());
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username');
  });

  it('debe rechazar sin token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('debe rechazar token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set({ Authorization: 'Bearer invalid-token-here' });
    expect(res.status).toBe(401);
  });
});
