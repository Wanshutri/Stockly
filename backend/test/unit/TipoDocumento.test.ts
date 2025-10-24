import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app';
import { query } from '../../src/db/postgres';

// Códigos SII usados para las pruebas (ahora son strings)
const CODIGO_BASE = "30";
const CODIGO_OTRO = "33";

describe('TipoDocumentoTributario API', () => {

beforeEach(async () => {
    // Limpiar tablas en orden inverso de dependencia
    await query('DELETE FROM documento_tributario');
    await query('DELETE FROM tipo_documento_tributario');
});

// Función auxiliar para crear un tipo de documento
const createTipoDocumento = async (codigo: string, nombre: string) => {
    return request(app)
        .post('/api/tipos-documento')
        .send({ codigo_sii: codigo, nombre_tipo: nombre });
};

describe('GET /api/tipos-documento', () => {
    it('Debe devolver un array vacío si no hay tipos de documento', async () => {
        const response = await request(app).get('/api/tipos-documento');
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('Debe devolver todos los tipos de documento', async () => {
        await createTipoDocumento(CODIGO_BASE, 'Factura');
        await createTipoDocumento(CODIGO_OTRO, 'Factura Electrónica');

        const response = await request(app).get('/api/tipos-documento');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ codigo_sii: CODIGO_BASE, nombre_tipo: 'Factura' }),
                expect.objectContaining({ codigo_sii: CODIGO_OTRO, nombre_tipo: 'Factura Electrónica' }),
            ])
        );
    });
});

describe('POST /api/tipos-documento', () => {
    it('Debe crear un nuevo tipo de documento correctamente (201 Created)', async () => {
        const response = await createTipoDocumento("100", 'Boleta Nueva');

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('codigo_sii', "100");
        expect(response.body).toHaveProperty('nombre_tipo', 'Boleta Nueva');
    });

    it('Debe devolver un error 400 si falta el nombre_tipo', async () => {
        const response = await request(app)
            .post('/api/tipos-documento')
            .send({ codigo_sii: "100" });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('El campo nombre_tipo es obligatorio y no debe estar vacío.');
    });

    it('Debe devolver un error 400 si falta el codigo_sii', async () => {
        const response = await request(app)
            .post('/api/tipos-documento')
            .send({ nombre_tipo: 'Factura Faltante' });

        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/obligatorio|código sii/i);
    });

    it('Debe devolver un error 409 si el codigo_sii ya existe (violación PK)', async () => {
        await createTipoDocumento(CODIGO_BASE, 'Original');
        const response = await createTipoDocumento(CODIGO_BASE, 'Duplicado');

        expect(response.status).toBe(409);
        expect(response.body.message).toBe('Ya existe un tipo de documento tributario con ese código SII.');
    });
});

describe('GET /api/tipos-documento/:codigo_sii', () => {
    it('Debe devolver un tipo de documento específico por su codigo_sii', async () => {
        await createTipoDocumento(CODIGO_BASE, 'Guía de Despacho');

        const response = await request(app).get(`/api/tipos-documento/${CODIGO_BASE}`);
        expect(response.status).toBe(200);
        expect(response.body.codigo_sii).toBe(CODIGO_BASE);
        expect(response.body.nombre_tipo).toBe('Guía de Despacho');
    });

    it('Debe devolver un error 404 para un codigo_sii que no existe', async () => {
        const response = await request(app).get('/api/tipos-documento/999');
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Tipo de documento no encontrado.');
    });
});

describe('PUT /api/tipos-documento/:codigo_sii', () => {
    it('Debe actualizar un tipo de documento existente (200 OK)', async () => {
        await createTipoDocumento(CODIGO_BASE, 'Original');

        const response = await request(app)
            .put(`/api/tipos-documento/${CODIGO_BASE}`)
            .send({ nombre_tipo: 'Nombre Actualizado' });

        expect(response.status).toBe(200);
        expect(response.body.nombre_tipo).toBe('Nombre Actualizado');
    });

    it('Debe devolver un error 404 al intentar actualizar un código que no existe', async () => {
        const response = await request(app)
            .put('/api/tipos-documento/999')
            .send({ nombre_tipo: 'NoExisto' });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Tipo de documento no encontrado.');
    });

    it('Debe devolver un error 400 si falta el nombre_tipo en la actualización', async () => {
        await createTipoDocumento(CODIGO_BASE, 'Original');
        const response = await request(app)
            .put(`/api/tipos-documento/${CODIGO_BASE}`)
            .send({ nombre_tipo: '' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('El campo nombre_tipo es obligatorio y no debe estar vacío.');
    });
});

describe('DELETE /api/tipos-documento/:codigo_sii', () => {
    it('Debe eliminar un tipo de documento existente (204 No Content)', async () => {
        await createTipoDocumento(CODIGO_BASE, 'AEliminar');

        const deleteResponse = await request(app).delete(`/api/tipos-documento/${CODIGO_BASE}`);
        expect(deleteResponse.status).toBe(204);

        const getResponse = await request(app).get(`/api/tipos-documento/${CODIGO_BASE}`);
        expect(getResponse.status).toBe(404);
    });

    it('Debe devolver un error 404 al intentar eliminar un código que no existe', async () => {
        const response = await request(app).delete('/api/tipos-documento/999');
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Tipo de documento no encontrado.');
    });
});


});
