import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app'; // Ajusta la ruta a tu archivo principal 'app'
import { query } from '../../src/db/postgres'; // Ajusta la ruta a tu config de DB

// -------------------------------------------------------------------
// --- DATOS DE PRUEBA (PAYLOADS) ---
// -------------------------------------------------------------------

// Estos payloads asumen que el beforeEach creará:
// 1. Una marca con id_marca = 1
// 2. Una categoría con id_categoria = 1

const PAYLOAD_A = {
    sku: 'SKU-TEST-A',
    nombre: 'Producto A (Prueba)',
    id_categoria: 1, // <- Ya existe en setupTests (Electrónica)
    id_marca: 1,     // <- Ya existe en setupTests (Marca Test)
    precio_venta: 100.50,
    precio_compra: 50.25,
    stock: 10,
    descripcion: 'Descripción del Producto A'
};

const PAYLOAD_B = {
    sku: 'SKU-TEST-B',
    nombre: 'Producto B (Prueba)',
    id_categoria: 1, // <- Ya existe en setupTests (Electrónica)
    id_marca: 1,     // <- Ya existe en setupTests (Marca Test)
    precio_venta: 200,
    precio_compra: 100,
    stock: 20,
    descripcion: 'Descripción del Producto B'
};

// -------------------------------------------------------------------
// --- SUITE DE PRUEBAS ---
// -------------------------------------------------------------------

describe('Producto API (PK=sku)', () => {

    // Función auxiliar para crear un producto
    // Asumimos que la ruta base es /api/productos
    const createProducto = async (payload: object) => {
        return request(app)
            .post('/api/productos')
            .send(payload);
    };

    describe('GET /api/productos', () => {
        it('Debe devolver al menos el producto inicial', async () => {
            const response = await request(app).get('/api/productos');
            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThanOrEqual(1);
            expect(response.body[0].sku).toBe('SKU-TEST');
        });

        it('Debe devolver todos los productos', async () => {
            await createProducto(PAYLOAD_A);
            await createProducto(PAYLOAD_B);

            const response = await request(app).get('/api/productos');
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(3); // Producto inicial + PAYLOAD_A + PAYLOAD_B
        });
    });

    describe('POST /api/productos', () => {
        it('Debe crear un nuevo producto correctamente (201 Created)', async () => {
            const response = await createProducto(PAYLOAD_A);

            expect(response.status).toBe(201);
            expect(response.body.sku).toBe(PAYLOAD_A.sku);
            expect(response.body.nombre).toBe(PAYLOAD_A.nombre);
            expect(response.body.id_categoria).toBe(PAYLOAD_A.id_categoria);
        });

        it('Debe devolver un error 400 si falta el SKU', async () => {
            const { sku, ...payloadSinSku } = PAYLOAD_A;
            const response = await createProducto(payloadSinSku);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Los campos SKU, nombre y descripcion son obligatorios y no deben estar vacíos.');
        });

        it('Debe devolver un error 400 si el nombre está vacío', async () => {
            const response = await createProducto({ ...PAYLOAD_A, nombre: '   ' });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Los campos SKU, nombre y descripcion son obligatorios y no deben estar vacíos.');
        });

        it('Debe devolver un error 400 si descripcion está vacío', async () => {
            const response = await createProducto({ ...PAYLOAD_A, descripcion: '   ' });
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Los campos SKU, nombre y descripcion son obligatorios y no deben estar vacíos.');
        });

        it('Debe devolver un error 400 si precio_venta es negativo', async () => {
            const response = await createProducto({ ...PAYLOAD_A, precio_venta: -10 });
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('precio_venta');
        });

        it('Debe devolver un error 400 si stock es negativo', async () => {
            const response = await createProducto({ ...PAYLOAD_A, stock: -1 });
            expect(response.status).toBe(400);
            expect(response.body.message).toContain('stock');
        });

        it('Debe devolver un error 409 si el SKU ya existe (violación UNIQUE)', async () => {
            await createProducto(PAYLOAD_A);
            const response = await createProducto(PAYLOAD_A); // Duplicado

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Ya existe un producto con ese SKU.');
        });

        it('Debe devolver un error 409 si id_categoria no existe (violación FK)', async () => {
            const response = await createProducto({ ...PAYLOAD_A, id_categoria: 9999 });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('La categoría (id_categoria) proporcionada no existe.');
        });

        it('Debe devolver un error 409 si id_marca no existe (violación FK)', async () => {
            const response = await createProducto({ ...PAYLOAD_A, id_marca: 9999 });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('La marca (id_marca) proporcionada no existe.');
        });
    });

    describe('GET /api/productos/:sku', () => {
        it('Debe devolver un producto específico por su sku', async () => {
            await createProducto(PAYLOAD_A);

            const response = await request(app).get(`/api/productos/${PAYLOAD_A.sku}`);
            expect(response.status).toBe(200);
            expect(response.body.sku).toBe(PAYLOAD_A.sku);
            expect(response.body.nombre).toBe(PAYLOAD_A.nombre);
        });

        it('Debe devolver un error 404 para un sku que no existe', async () => {
            const response = await request(app).get('/api/productos/SKU-INEXISTENTE');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Producto no encontrado.');
        });

        it('Debe devolver un error 400 para un sku inválido (ej. espacio)', async () => {
            // El controlador (get_producto_by_sku) valida que el param no esté vacío
            const response = await request(app).get('/api/productos/%20'); // SKU como ' ' (URL encoded)
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('El parámetro SKU es inválido o está vacío.');
        });
    });

    describe('PUT /api/productos/:sku', () => {
        it('Debe actualizar un producto existente (200 OK)', async () => {
            await createProducto(PAYLOAD_A);
            const actualizacion = { nombre: 'Nombre Actualizado', stock: 99 };

            const response = await request(app)
                .put(`/api/productos/${PAYLOAD_A.sku}`)
                .send(actualizacion);

            expect(response.status).toBe(200);
            expect(response.body.sku).toBe(PAYLOAD_A.sku);
            expect(response.body.nombre).toBe('Nombre Actualizado');
            expect(response.body.stock).toBe(99);
        });

        it('Debe devolver un error 404 al intentar actualizar un sku que no existe', async () => {
            const response = await request(app)
                .put('/api/productos/SKU-INEXISTENTE')
                .send({ nombre: 'NoExisto' });
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Producto no encontrado.');
        });

        it('Debe devolver un error 400 si el body está vacío', async () => {
            await createProducto(PAYLOAD_A);

            const response = await request(app)
                .put(`/api/productos/${PAYLOAD_A.sku}`)
                .send({}); // Body vacío

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('No se proporcionaron campos para actualizar.');
        });

        it('Debe devolver un error 400 si el nombre en la actualización está vacío', async () => {
            await createProducto(PAYLOAD_A);

            const response = await request(app)
                .put(`/api/productos/${PAYLOAD_A.sku}`)
                .send({ nombre: ' ' }); // Nombre vacío

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('El campo nombre no puede ser una cadena vacía.');
        });

        it('Debe devolver un error 409 si el nuevo id_categoria no existe (violación FK)', async () => {
            await createProducto(PAYLOAD_A);

            const response = await request(app)
                .put(`/api/productos/${PAYLOAD_A.sku}`)
                .send({ id_categoria: 9999 });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('La categoría (id_categoria) proporcionada no existe.');
        });
    });

    describe('DELETE /api/productos/:sku', () => {
        it('Debe eliminar un producto existente (204 No Content)', async () => {
            await createProducto(PAYLOAD_A);

            const deleteResponse = await request(app).delete(`/api/productos/${PAYLOAD_A.sku}`);
            expect(deleteResponse.status).toBe(204);

            // Verificar que ya no existe
            const getResponse = await request(app).get(`/api/productos/${PAYLOAD_A.sku}`);
            expect(getResponse.status).toBe(404);
        });

        it('Debe devolver un error 404 al intentar eliminar un sku que no existe', async () => {
            const response = await request(app).delete('/api/productos/SKU-INEXISTENTE');
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Producto no encontrado.');
        });

        it('Debe devolver un error 400 al intentar eliminar un sku inválido (ej. espacio)', async () => {
            const response = await request(app).delete('/api/productos/%20');
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('El parámetro SKU es inválido o está vacío.');
        });

        it('Debe devolver un error 409 si el producto está siendo usado (violación FK)', async () => {
            // 1. Crear el producto
            await createProducto(PAYLOAD_A); // SKU-TEST-A

            // 2. Crear una compra (simula una compra existente)
            await query(
                "INSERT INTO compra (id_compra, fecha, total, id_cliente, monto_tarjeta, monto_efectivo) VALUES (1, NOW(), 200, 1,1000,3909) ON CONFLICT DO NOTHING"
            );

            // 3. Crear un detalle_compra que use el producto SKU-TEST-A
            await query(
                `INSERT INTO detalle_compra (sku, id_compra, cantidad, subtotal) VALUES ($1, 1, 2, 200) ON CONFLICT DO NOTHING`,
                [PAYLOAD_A.sku]
            );

            // 4. Intentar eliminar el producto
            const deleteResponse = await request(app).delete(`/api/productos/${PAYLOAD_A.sku}`);

            // 5. Verificar el error 409 Conflict
            expect(deleteResponse.status).toBe(409);
            expect(deleteResponse.body.message).toContain('No se puede eliminar el producto porque todavía existen');
        });

    });

});
