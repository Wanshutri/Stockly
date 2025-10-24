import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app'; // Ajusta la ruta a tu archivo principal 'app'
import { query } from '../../src/db/postgres'; // Ajusta la ruta a tu config de DB

// Nombres usados para las pruebas
const NOMBRE_BASE = "Electrónica";
const NOMBRE_OTRO = "Ropa";

describe('TipoCategoria API (PK=id_categoria)', () => {

    beforeEach(async () => {
        // Limpiar tablas en orden inverso de dependencia (según el schema)
        // Asumimos que 'producto' referencia 'tipo_categoria'
        await query('DELETE FROM producto'); 
        await query('DELETE FROM tipo_categoria');
        
        // Resetear la secuencia del ID auto-incremental
        // Esto es CRUCIAL para que los IDs de prueba sean predecibles (ej. 1, 2, 3...)
        try {
            // Asegúrate que el nombre de la secuencia coincida con tu base de datos
            await query('ALTER SEQUENCE tipo_categoria_id_categoria_seq RESTART WITH 1');
        } catch (error) {
            console.error("Error reseteando la secuencia:", error);
        }
    });

    // Función auxiliar para crear un tipo de categoría
    // Asumimos que la ruta base es /api/categorias
    const createTipoCategoria = async (nombre: string) => {
        return request(app)
            .post('/api/categorias') 
            .send({ nombre_categoria: nombre });
    };

    describe('GET /api/categorias', () => {
        it('Debe devolver un array vacío si no hay tipos de categoría', async () => {
            const response = await request(app).get('/api/categorias');
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        it('Debe devolver todos los tipos de categoría', async () => {
            await createTipoCategoria(NOMBRE_BASE);
            await createTipoCategoria(NOMBRE_OTRO);

            const response = await request(app).get('/api/categorias');
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(2);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    // Los IDs deben ser 1 y 2 gracias al RESTART
                    expect.objectContaining({ id_categoria: 1, nombre_categoria: NOMBRE_BASE }),
                    expect.objectContaining({ id_categoria: 2, nombre_categoria: NOMBRE_OTRO }),
                ])
            );
        });
    });

    describe('POST /api/categorias', () => {
        it('Debe crear un nuevo tipo de categoría correctamente (201 Created)', async () => {
            const response = await createTipoCategoria('Hogar');

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id_categoria', 1); // ID es 1
            expect(response.body).toHaveProperty('nombre_categoria', 'Hogar');
        });

        it('Debe devolver un error 400 si falta el nombre_categoria', async () => {
            const response = await request(app)
                .post('/api/categorias')
                .send({}); // Body vacío

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('El campo nombre_categoria es obligatorio y no debe estar vacío.');
        });

        it('Debe devolver un error 400 si el nombre_categoria está vacío', async () => {
            const response = await request(app)
                .post('/api/categorias')
                .send({ nombre_categoria: ' ' }); // Body con string vacío

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('El campo nombre_categoria es obligatorio y no debe estar vacío.');
        });

        it('Debe devolver un error 409 si el nombre_categoria ya existe (violación UNIQUE)', async () => {
            // Esto asume que tienes una restricción UNIQUE en 'nombre_categoria'
            await createTipoCategoria(NOMBRE_BASE);
            const response = await createTipoCategoria(NOMBRE_BASE); // Duplicado

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Ya existe un tipo de categoría con ese nombre.');
        });
    });

    describe('GET /api/categorias/:id', () => {
        it('Debe devolver un tipo de categoría específico por su id', async () => {
            await createTipoCategoria(NOMBRE_BASE); // Crea ID 1

            const response = await request(app).get(`/api/categorias/1`);
            expect(response.status).toBe(200);
            expect(response.body.id_categoria).toBe(1);
            expect(response.body.nombre_categoria).toBe(NOMBRE_BASE);
        });

        it('Debe devolver un error 404 para un id que no existe', async () => {
            const response = await request(app).get('/api/categorias/9999');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Tipo de categoría no encontrado.');
        });

        it('Debe devolver un error 400 para un id inválido (no numérico)', async () => {
            const response = await request(app).get('/api/categorias/abc');
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('ID de categoría inválido.');
        });
    });

    describe('PUT /api/categorias/:id', () => {
        it('Debe actualizar un tipo de categoría existente (200 OK)', async () => {
            await createTipoCategoria('Original'); // Crea ID 1

            const response = await request(app)
                .put(`/api/categorias/1`)
                .send({ nombre_categoria: 'Nombre Actualizado' });

            expect(response.status).toBe(200);
            expect(response.body.id_categoria).toBe(1);
            expect(response.body.nombre_categoria).toBe('Nombre Actualizado');
        });

        it('Debe devolver un error 404 al intentar actualizar un id que no existe', async () => {
            const response = await request(app)
                .put('/api/categorias/9999')
                .send({ nombre_categoria: 'NoExisto' });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Tipo de categoría no encontrado.');
        });

        it('Debe devolver un error 400 si falta el nombre_categoria en la actualización', async () => {
            await createTipoCategoria('Original'); // Crea ID 1
            
            const response = await request(app)
                .put(`/api/categorias/1`)
                .send({ nombre_categoria: '' }); // Nombre vacío

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('El campo nombre_categoria es obligatorio y no debe estar vacío.');
        });

        it('Debe devolver un error 400 al intentar actualizar un id inválido (no numérico)', async () => {
            const response = await request(app)
                .put('/api/categorias/abc')
                .send({ nombre_categoria: 'Invalido' });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('ID de categoría inválido.');
        });

        it('Debe devolver un error 409 si el nuevo nombre_categoria ya existe', async () => {
            await createTipoCategoria(NOMBRE_BASE); // ID 1
            await createTipoCategoria(NOMBRE_OTRO); // ID 2

            // Intentar cambiar ID 2 (NOMBRE_OTRO) al ya existente NOMBRE_BASE
            const response = await request(app)
                .put(`/api/categorias/2`)
                .send({ nombre_categoria: NOMBRE_BASE });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Ya existe un tipo de categoría con ese nombre.');
        });
    });

    describe('DELETE /api/categorias/:id', () => {
        it('Debe eliminar un tipo de categoría existente (204 No Content)', async () => {
            await createTipoCategoria('AEliminar'); // Crea ID 1

            const deleteResponse = await request(app).delete(`/api/categorias/1`);
            expect(deleteResponse.status).toBe(204);

            // Verificar que ya no existe
            const getResponse = await request(app).get(`/api/categorias/1`);
            expect(getResponse.status).toBe(404);
        });

        it('Debe devolver un error 404 al intentar eliminar un id que no existe', async () => {
            const response = await request(app).delete('/api/categorias/9999');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Tipo de categoría no encontrado.');
        });

        it('Debe devolver un error 400 al intentar eliminar un id inválido (no numérico)', async () => {
            const response = await request(app).delete('/api/categorias/abc');
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('ID de categoría inválido.');
        });

        it('Debe devolver un error 409 si la categoría está siendo usada (violación FK)', async () => {
            // 1. Crear la categoría
            await createTipoCategoria(NOMBRE_BASE); // Crea ID 1
            
            // 2. Crear una marca (necesaria para el producto)
            await query("INSERT INTO marca (id_marca, nombre_marca) VALUES (1, 'MarcaPrueba') ON CONFLICT DO NOTHING");
            
            // 3. Crear un producto que *use* la categoría 1
            await query(
                `INSERT INTO producto (sku, nombre, id_categoria, id_marca, precio_venta, precio_compra, stock) 
                 VALUES ('TEST-SKU', 'ProductoPrueba', 1, 1, 100, 50, 10)`
            );

            // 4. Intentar eliminar la categoría 1
            const deleteResponse = await request(app).delete(`/api/categorias/1`);
            
            // 5. Verificar el error 409 Conflict
            expect(deleteResponse.status).toBe(409);
            expect(deleteResponse.body.message).toContain('No se puede eliminar');
        });
    });

});