import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';
import { query } from '../../src/db/postgres';

// Datos de prueba consistentes
const TEST_USER = {
    nombre: 'Usuario Prueba',
    email: 'prueba@test.com',
    password: 'password123',
    id_tipo: 1, // Asumimos que el tipo 1 (ej: "User") existe y es válido
};

const SECOND_USER = {
    nombre: 'Usuario Dos',
    email: 'segundo@test.com',
    password: 'testpassword',
    id_tipo: 1,
};

describe('Usuario API', () => {
    beforeEach(async () => {

        // Limpieza de tablas dependientes e independientes
        await query('DELETE FROM usuario');

        await query('DELETE FROM tipo_usuario');
        // Asegurarse de que el tipo de usuario base exista para las pruebas
        await query(`
      INSERT INTO tipo_usuario (id_tipo, nombre_tipo) 
      VALUES (1, 'TestType') 
      `);
        await query('ALTER SEQUENCE usuario_id_usuario_seq RESTART WITH 1');
    });

    // --- CREATE USUARIO (POST /api/usuarios) ---
    describe('POST /api/usuarios (create_usuario)', () => {
        it('Debe crear un nuevo usuario correctamente', async () => {
            const response = await request(app)
                .post('/api/usuarios')
                .send(TEST_USER);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id_usuario', 1);
            expect(response.body).toHaveProperty('nombre', TEST_USER.nombre);
            expect(response.body).toHaveProperty('email', TEST_USER.email);
            expect(response.body).toHaveProperty('activo', true);
            expect(response.body).toHaveProperty('id_tipo', TEST_USER.id_tipo);
            // La contraseña (hash) no debe ser retornada, solo campos públicos
            expect(response.body).not.toHaveProperty('password');
        });

        it('Debe devolver un error 400 si faltan campos obligatorios', async () => {
            const response = await request(app)
                .post('/api/usuarios')
                .send({ nombre: 'Incompleto' }); // Faltan email, password, id_tipo

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(
                'nombre, email, password e id_tipo son obligatorios'
            );
        });

        it('Debe devolver un error 400 si la contraseña es muy corta (< 6)', async () => {
            const response = await request(app)
                .post('/api/usuarios')
                .send({ ...TEST_USER, password: 'cort' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(
                'password debe tener al menos 6 caracteres'
            );
        });

        it('Debe devolver un error 409 si el email ya está registrado', async () => {
            // Primer registro exitoso
            await request(app).post('/api/usuarios').send(TEST_USER);

            // Segundo registro con el mismo email
            const response = await request(app).post('/api/usuarios').send(TEST_USER);

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('email ya registrado');
        });

        it('Debe devolver un error 409 si el tipo de usuario no existe', async () => {
            const response = await request(app)
                .post('/api/usuarios')
                .send({
                    nombre: 'Usuario Prueba',
                    email: 'prueba@test.com',
                    password: 'password123',
                    id_tipo: 9999
                });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe(
                'No se puede crear usuario porque el Tipo de Usuario no existe.'
            );
        });
    });

    // --- GET USUARIOS (GET /api/usuarios) ---
    describe('GET /api/usuarios (get_usuarios)', () => {
        it('Debe devolver un array vacío si no hay usuarios', async () => {
            const response = await request(app).get('/api/usuarios');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('Debe devolver todos los usuarios', async () => {
            await request(app).post('/api/usuarios').send(TEST_USER);
            await request(app).post('/api/usuarios').send(SECOND_USER);

            const response = await request(app).get('/api/usuarios');
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
            expect(response.body[0].email).toBe(TEST_USER.email);
            expect(response.body[1].email).toBe(SECOND_USER.email);
        });
    });

    // --- GET USUARIO BY ID (GET /api/usuarios/:id) ---
    describe('GET /api/usuarios/:id (get_usuario_by_id)', () => {
        it('Debe devolver un usuario específico por su ID', async () => {
            const postResponse = await request(app)
                .post('/api/usuarios')
                .send(TEST_USER);
            const newId = postResponse.body.id_usuario;

            const response = await request(app).get(`/api/usuarios/${newId}`);
            expect(response.status).toBe(200);
            expect(response.body.id_usuario).toBe(newId);
            expect(response.body.email).toBe(TEST_USER.email);
            expect(response.body).not.toHaveProperty('password');
        });

        it('Debe devolver un error 404 para un ID que no existe', async () => {
            const response = await request(app).get('/api/usuarios/9999');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('usuario no encontrado');
        });

        it('Debe devolver un error 400 para un ID inválido', async () => {
            const response = await request(app).get('/api/usuarios/abc');
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('id inválido');
        });
    });

    // --- UPDATE USUARIO (PUT /api/usuarios/:id) ---
    describe('PUT /api/usuarios/:id (update_usuario)', () => {
        let newId: number;

        beforeEach(async () => {
            const postResponse = await request(app)
                .post('/api/usuarios')
                .send(TEST_USER);
            newId = postResponse.body.id_usuario;
        });

        it('Debe actualizar el nombre y email del usuario', async () => {
            const response = await request(app)
                .put(`/api/usuarios/${newId}`)
                .send({ nombre: 'Nombre Editado', email: 'nuevo@test.com' });

            expect(response.status).toBe(200);
            expect(response.body.nombre).toBe('Nombre Editado');
            expect(response.body.email).toBe('nuevo@test.com');
        });

        it('Debe actualizar la contraseña y mantener otros campos', async () => {
            const newPassword = 'newsecurepassword';
            const response = await request(app)
                .put(`/api/usuarios/${newId}`)
                .send({ password: newPassword });

            expect(response.status).toBe(200);
            expect(response.body.id_usuario).toBe(newId);

            // Intentar loguearse con la nueva contraseña para verificar el hash
            const loginResponse = await request(app)
                .post('/api/usuarios/login')
                .send({ email: TEST_USER.email, password: newPassword });

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body).toHaveProperty('token');
        });

        it('Debe devolver 400 si se envía un nombre vacío', async () => {
            const response = await request(app)
                .put(`/api/usuarios/${newId}`)
                .send({ nombre: ' ' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('nombre no puede ser vacío');
        });

        it('Debe devolver 409 si el nuevo email ya está registrado', async () => {
            // Crear un segundo usuario
            await request(app).post('/api/usuarios').send(SECOND_USER);

            // Intentar actualizar el primer usuario con el email del segundo
            const response = await request(app)
                .put(`/api/usuarios/${newId}`)
                .send({ email: SECOND_USER.email });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('email ya registrado');
        });

        it('Debe devolver 404 al intentar actualizar un usuario que no existe', async () => {
            const response = await request(app)
                .put('/api/usuarios/9999')
                .send({ nombre: 'NoExisto' });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('usuario no encontrado');
        });
    });

    // --- DELETE USUARIO (DELETE /api/usuarios/:id) ---
    describe('DELETE /api/usuarios/:id (delete_usuario)', () => {
        it('Debe eliminar un usuario existente', async () => {
            const postResponse = await request(app)
                .post('/api/usuarios/')
                .send(TEST_USER);
            const newId = postResponse.body.id_usuario;

            const deleteResponse = await request(app).delete(`/api/usuarios/${newId}`);
            expect(deleteResponse.status).toBe(204);

            // Verificar que realmente se haya eliminado
            const getResponse = await request(app).get(`/api/usuarios/${newId}`);
            expect(getResponse.status).toBe(404);
        });

        it('Debe devolver un error 404 al intentar eliminar un usuario que no existe', async () => {
            const response = await request(app).delete('/api/usuarios/9999');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('usuario no encontrado');
        });
    });

    // --- LOGIN USUARIO (POST /api/auth/login) ---
    describe('POST /api/auth/login (login_usuario)', () => {
        beforeEach(async () => {
            // Asegurarse de que el usuario de prueba exista
            await request(app).post('/api/usuarios').send(TEST_USER);
        });

        it('Debe devolver un token JWT con credenciales válidas', async () => {
            const response = await request(app)
                .post('/api/usuarios/login')
                .send({ email: TEST_USER.email, password: TEST_USER.password });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(typeof response.body.token).toBe('string');
            // No debería devolver información sensible del usuario (ej: el hash)
            expect(response.body).not.toHaveProperty('password');
        });

        it('Debe devolver 401 para contraseña incorrecta', async () => {
            const response = await request(app)
                .post('/api/usuarios/login')
                .send({ email: TEST_USER.email, password: 'wrongpassword' });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('credenciales inválidas');
        });

        it('Debe devolver 401 para email no registrado', async () => {
            const response = await request(app)
                .post('/api/usuarios/login')
                .send({ email: 'noexiste@test.com', password: TEST_USER.password });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('credenciales inválidas');
        });

        it('Debe devolver 400 si faltan email o password', async () => {
            const response = await request(app)
                .post('/api/usuarios/login')
                .send({ email: TEST_USER.email });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('email y password son obligatorios');
        });
    });
});
