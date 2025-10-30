import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app'; // Ajusta la ruta a tu archivo principal 'app'
import { query } from '../../src/db/postgres'; // Ajusta la ruta a tu config de DB

// Nombres usados para las pruebas
const NOMBRE_BASE = "Electrónica";
const NOMBRE_OTRO = "Ropa";

describe('TipoCategoria API (PK=id_categoria)', () => {

    // Función auxiliar MODIFICADA: Ahora retorna el cuerpo (body) de la respuesta 
    // y maneja la aserción de status.
    const createTipoCategoria = async (nombre: string) => {
        const response = await request(app)
            .post('/api/categorias')
            .send({ nombre_categoria: nombre });

        expect(response.status).toBe(201);
        return response.body; // Retorna { id_categoria: N, nombre_categoria: '...' }
    };

    describe('GET /api/categorias', () => {
        it('Debe devolver al menos la categoría inicial', async () => {
            const response = await request(app).get('/api/categorias');
            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
            // Asumimos que la categoría creada en el beforeEach es la primera
            expect(response.body[0]).toEqual(expect.objectContaining({
                id_categoria: 1,
                // Asumimos que la categoría inicial del beforeEach es 'Categoría de Prueba'
                nombre_categoria: expect.any(String)
            }));
        });

        it('Debe devolver todos los tipos de categoría', async () => {
            // Se asume que el beforeEach ya insertó al menos una.
            const categoria1 = await createTipoCategoria(NOMBRE_BASE);
            const categoria2 = await createTipoCategoria(NOMBRE_OTRO);

            const response = await request(app).get('/api/categorias');
            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThanOrEqual(3); // Base + 2 nuevas

            expect(response.body).toEqual(
                expect.arrayContaining([
                    // Usa los objetos devueltos por la creación
                    expect.objectContaining(categoria1),
                    expect.objectContaining(categoria2),
                ])
            );
        });
    });

    // --- Sección POST SIN CAMBIOS en la lógica de creación, solo en la aserción ---
    describe('POST /api/categorias', () => {
        it('Debe crear un nuevo tipo de categoría correctamente (201 Created)', async () => {
            const response = await request(app)
                .post('/api/categorias')
                .send({ nombre_categoria: 'Hogar' });

            expect(response.status).toBe(201);
            // **Aserción mejorada:** Verifica la propiedad, pero no asume el valor (excepto en el nombre)
            expect(response.body).toHaveProperty('id_categoria');
            expect(typeof response.body.id_categoria).toBe('number');
            expect(response.body.nombre_categoria).toBe('Hogar');
        });

        it('Debe devolver un error 400 si falta el nombre_categoria', async () => {
            const response = await request(app)
                .post('/api/categorias')
                .send({}); // Body vacío

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('El campo nombre_categoria es obligatorio y no debe estar vacío.');
        });

        // ... (otros tests de error 400 y 409) ...
        it('Debe devolver un error 409 si el nombre_categoria ya existe (violación UNIQUE)', async () => {
            await createTipoCategoria(NOMBRE_BASE);
            const response = await request(app) // Usar request directo para capturar el 409
                .post('/api/categorias')
                .send({ nombre_categoria: NOMBRE_BASE });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Ya existe un tipo de categoría con ese nombre.');
        });
    });
    // ---------------------------------------------------------------------------------

    describe('GET /api/categorias/:id', () => {
        it('Debe devolver un tipo de categoría específico por su id', async () => {
            // PASO 1: Crear la categoría y capturar su ID dinámico
            const categoriaCreada = await createTipoCategoria(NOMBRE_BASE);
            const categoriaId = categoriaCreada.id_categoria; // ID capturado (ej. 2)

            // PASO 2: Usar el ID capturado
            const response = await request(app).get(`/api/categorias/${categoriaId}`);

            expect(response.status).toBe(200);
            // Verifica que el body es exactamente el objeto que creamos
            expect(response.body).toEqual(categoriaCreada);
        });

        it('Debe devolver un error 404 para un id que no existe', async () => {
            const response = await request(app).get('/api/categorias/9999');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Tipo de categoría no encontrado.');
        });

        // ... (otros tests de error 400) ...
    });

    describe('PUT /api/categorias/:id', () => {
        it('Debe actualizar un tipo de categoría existente (200 OK)', async () => {
            // PASO 1: Crear la categoría y capturar su ID dinámico
            const categoriaCreada = await createTipoCategoria('Original');
            const categoriaId = categoriaCreada.id_categoria; // ID capturado (ej. 2)
            const nombreActualizado = 'Nombre Actualizado';

            // PASO 2: Usar el ID capturado para la actualización
            const response = await request(app)
                .put(`/api/categorias/${categoriaId}`)
                .send({ nombre_categoria: nombreActualizado });

            expect(response.status).toBe(200);
            expect(response.body.id_categoria).toBe(categoriaId);
            expect(response.body.nombre_categoria).toBe(nombreActualizado);
        });

        it('Debe devolver un error 409 si el nuevo nombre_categoria ya existe', async () => {
            // PASO 1: Crear dos categorías y capturar sus IDs
            await createTipoCategoria(NOMBRE_BASE);
            const categoriaAActualizar = await createTipoCategoria(NOMBRE_OTRO); // ID capturado (ej. 2)

            // Intentar cambiar ID 2 (NOMBRE_OTRO) al ya existente NOMBRE_BASE
            const response = await request(app)
                .put(`/api/categorias/${categoriaAActualizar.id_categoria}`)
                .send({ nombre_categoria: NOMBRE_BASE });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Ya existe un tipo de categoría con ese nombre.');
        });

        // ... (otros tests de error 404 y 400) ...
    });

    describe('DELETE /api/categorias/:id', () => {
        it('Debe eliminar un tipo de categoría existente (204 No Content)', async () => {
            // PASO 1: Crear la categoría y capturar su ID dinámico
            const categoriaAEliminar = await createTipoCategoria('AEliminar');
            const categoriaId = categoriaAEliminar.id_categoria; // ID capturado (ej. 2)

            // PASO 2: Eliminar con el ID capturado
            const deleteResponse = await request(app).delete(`/api/categorias/${categoriaId}`);
            expect(deleteResponse.status).toBe(204);

            // PASO 3: Verificar que ya no existe (usando el ID capturado)
            const getResponse = await request(app).get(`/api/categorias/${categoriaId}`);
            expect(getResponse.status).toBe(404);
        });

        // ... (otros tests de error 404 y 400) ...

        it('Debe devolver un error 409 si la categoría está siendo usada (violación FK)', async () => {
            // 1. Crear la categoría y capturar su ID dinámico
            const categoriaFK = await createTipoCategoria(NOMBRE_BASE);
            const categoriaId = categoriaFK.id_categoria; // ID capturado (ej. 2)

            // 2. Crear una marca (necesaria para el producto), asegurando que el ID de Marca sea fijo.
            // Esto asume que el `beforeEach` ya reseteó las secuencias.
            await query("INSERT INTO marca (id_marca, nombre_marca) VALUES (1, 'MarcaPrueba') ON CONFLICT DO NOTHING");

            // 3. Crear un producto que *use* la categoría recién creada
            await query(
                `INSERT INTO producto (sku, nombre, id_categoria, id_marca, precio_venta, precio_compra, stock, descripcion) 
                 VALUES ('TEST-SKU', 'ProductoPrueba', ${categoriaId}, 1, 100, 50, 10, 'Descripción Prueba')`
            );

            // 4. Intentar eliminar la categoría
            const deleteResponse = await request(app).delete(`/api/categorias/${categoriaId}`);

            // 5. Verificar el error 409 Conflict
            expect(deleteResponse.status).toBe(409);
            expect(deleteResponse.body.message).toContain('No se puede eliminar');
        });
    });

});