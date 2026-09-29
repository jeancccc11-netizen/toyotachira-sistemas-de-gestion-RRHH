const request = require('supertest');
const app = require('./helpers/app');
const { getAuthHeader, generateToken } = require('./helpers/db');

const H = getAuthHeader();
let uid = null;

// Token de un usuario NO admin para verificar que el CRUD exige rol admin
const noAdminH = {
  Authorization: `Bearer ${generateToken({ id: 999, username: 'consulta1', rol: 'consulta' })}`,
};

describe('POST /api/usuarios', () => {
  it('debe crear un usuario (admin)', async () => {
    const res = await request(app).post('/api/usuarios').set(H).send({
      username: 'usuario_crud_test', password: 'secreto123', rol: 'rrhh',
    });
    expect([201, 409]).toContain(res.status); // 409 si quedó de una corrida anterior
    if (res.status === 201) {
      expect(res.body.user.rol).toBe('rrhh');
      uid = res.body.user.id;
    } else {
      // recuperar el id por username
      const list = await request(app).get('/api/usuarios').set(H);
      uid = list.body.find((u) => u.username === 'usuario_crud_test')?.id;
    }
    expect(uid).toBeTruthy();
  });

  it('debe rechazar contraseña corta', async () => {
    const res = await request(app).post('/api/usuarios').set(H).send({
      username: 'otro_test', password: '123', rol: 'consulta',
    });
    expect(res.status).toBe(400);
  });

  it('debe rechazar rol inválido', async () => {
    const res = await request(app).post('/api/usuarios').set(H).send({
      username: 'otro_test2', password: 'secreto123', rol: 'superadmin',
    });
    expect(res.status).toBe(400);
  });

  it('debe rechazar sin rol admin', async () => {
    const res = await request(app).post('/api/usuarios').set(noAdminH).send({
      username: 'intruso', password: 'secreto123', rol: 'admin',
    });
    expect(res.status).toBe(403);
  });
});

describe('PUT /api/usuarios/:id', () => {
  it('debe editar rol y estado', async () => {
    const res = await request(app).put(`/api/usuarios/${uid}`).set(H).send({
      rol: 'consulta', activo: false,
    });
    expect(res.status).toBe(200);
    expect(res.body.rol).toBe('consulta');
    expect(res.body.activo).toBe(false);
  });

  it('debe reactivar el usuario', async () => {
    const res = await request(app).put(`/api/usuarios/${uid}`).set(H).send({ activo: true });
    expect(res.status).toBe(200);
    expect(res.body.activo).toBe(true);
  });
});

describe('PUT /api/usuarios/:id/password', () => {
  it('debe cambiar la contraseña y permitir login con la nueva', async () => {
    const res = await request(app).put(`/api/usuarios/${uid}/password`).set(H)
      .send({ password: 'nuevaClave456' });
    expect(res.status).toBe(200);

    // login con la contraseña nueva (el usuario debe estar activo)
    await request(app).put(`/api/usuarios/${uid}`).set(H).send({ activo: true });
    const login = await request(app).post('/api/auth/login')
      .send({ username: 'usuario_crud_test', password: 'nuevaClave456' });
    expect(login.status).toBe(200);
  });

  it('debe rechazar contraseña corta', async () => {
    const res = await request(app).put(`/api/usuarios/${uid}/password`).set(H)
      .send({ password: '123' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/usuarios/:id', () => {
  it('debe impedir que un admin se elimine a sí mismo', async () => {
    // el token de H pertenece a { id: 1, username: 'admin' }
    const res = await request(app).delete('/api/usuarios/1').set(H);
    expect(res.status).toBe(400);
  });

  it('debe eliminar el usuario de prueba', async () => {
    const res = await request(app).delete(`/api/usuarios/${uid}`).set(H);
    expect(res.status).toBe(200);
    const after = await request(app).get('/api/usuarios').set(H);
    expect(after.body.find((u) => u.id === uid)).toBeUndefined();
  });

  it('debe retornar 404 al eliminar inexistente', async () => {
    const res = await request(app).delete('/api/usuarios/999999').set(H);
    expect(res.status).toBe(404);
  });
});
