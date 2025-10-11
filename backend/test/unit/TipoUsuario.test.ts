import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';
import { query } from '../../src/db/postgres';

describe('TipoUsuario API', () => {

  beforeEach(async () => {
    await query('DELETE FROM tipo_usuario');
    await query('ALTER SEQUENCE tipo_usuario_id_tipo_seq RESTART WITH 1');
  });

  describe('GET /api/tipos-usuario', () => {
    it('Debe devolver un array vacío si no hay tipos de usuario', async () => {
      const response = await request(app).get('/api/tipos-usuario');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('Debe devolver todos los tipos de usuario', async () => {
      await request(app).post('/api/tipos-usuario').send({ nombre_tipo: 'Admin' });
      await request(app).post('/api/tipos-usuario').send({ nombre_tipo: 'User' });

      const response = await request(app).get('/api/tipos-usuario');
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].nombre_tipo).toBe('Admin');
      expect(response.body[1].nombre_tipo).toBe('User');
    });
  });

  describe('POST /api/tipos-usuario', () => {
    it('Debe crear un nuevo tipo de usuario correctamente', async () => {
      const response = await request(app)
        .post('/api/tipos-usuario')
        .send({ nombre_tipo: 'Administrador' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id_tipo', 1);
      expect(response.body).toHaveProperty('nombre_tipo', 'Administrador');
    });

    it('Debe devolver un error 400 si falta el nombre_tipo', async () => {
      const response = await request(app)
        .post('/api/tipos-usuario')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('nombre_tipo es obligatorio');
    });
  });

  describe('GET /api/tipos-usuario/:id', () => {
    it('Debe devolver un tipo de usuario específico por su ID', async () => {
      const postResponse = await request(app)
        .post('/api/tipos-usuario')
        .send({ nombre_tipo: 'Vendedor' });
      const newId = postResponse.body.id_tipo;

      const response = await request(app).get(`/api/tipos-usuario/${newId}`);
      expect(response.status).toBe(200);
      expect(response.body.id_tipo).toBe(newId);
      expect(response.body.nombre_tipo).toBe('Vendedor');
    });

    it('Debe devolver un error 404 para un ID que no existe', async () => {
      const response = await request(app).get('/api/tipos-usuario/9999');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Tipo de usuario no encontrado');
    });
  });

  describe('PUT /api/tipos-usuario/:id', () => {
    it('Debe actualizar un tipo de usuario existente', async () => {
      const postResponse = await request(app)
        .post('/api/tipos-usuario')
        .send({ nombre_tipo: 'Original' });
      const newId = postResponse.body.id_tipo;

      const response = await request(app)
        .put(`/api/tipos-usuario/${newId}`)
        .send({ nombre_tipo: 'Actualizado' });

      expect(response.status).toBe(200);
      expect(response.body.nombre_tipo).toBe('Actualizado');
    });

    it('Debe devolver un error 404 al intentar actualizar un tipo de usuario que no existe', async () => {
      const response = await request(app)
        .put('/api/tipos-usuario/9999')
        .send({ nombre_tipo: 'NoExisto' });
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Tipo de usuario no encontrado');
    });
  });

  describe('DELETE /api/tipos-usuario/:id', () => {
    it('Debe eliminar un tipo de usuario existente', async () => {
      const postResponse = await request(app)
        .post('/api/tipos-usuario')
        .send({ nombre_tipo: 'AEliminar' });
      const newId = postResponse.body.id_tipo;

      const deleteResponse = await request(app).delete(`/api/tipos-usuario/${newId}`);
      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(app).get(`/api/tipos-usuario/${newId}`);
      expect(getResponse.status).toBe(404);
    });

    it('Debe devolver un error 404 al intentar eliminar un tipo de usuario que no existe', async () => {
      const response = await request(app).delete('/api/tipos-usuario/9999');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Tipo de usuario no encontrado');
    });
  });
});
