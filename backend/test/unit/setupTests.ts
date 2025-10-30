import { beforeEach } from '@jest/globals';
import { query } from '../../src/db/postgres';;

const SEQUENCES_TO_RESET = [
    "cliente_id_cliente_seq",
    "compra_id_compra_seq",
    "documento_tributario_id_documento_seq",
    "marca_id_marca_seq",
    "tipo_categoria_id_categoria_seq",
    "tipo_usuario_id_tipo_seq",
    "usuario_id_usuario_seq",
];

// Bloque beforeEach que se ejecuta antes de cada prueba a nivel global
beforeEach(async () => {
    // 1. LIMPIEZA DE DATOS (Orden del más dependiente al menos dependiente)
    // El orden aquí es crucial para evitar errores de Clave Foránea (FK) en PostgreSQL.
    await query('DELETE FROM detalle_compra');
    await query('DELETE FROM documento_tributario');
    await query('DELETE FROM producto');
    await query('DELETE FROM compra');
    await query('DELETE FROM usuario');
    await query('DELETE FROM cliente');
    await query('DELETE FROM marca');
    await query('DELETE FROM tipo_categoria');
    await query('DELETE FROM tipo_usuario');
    await query('DELETE FROM tipo_documento_tributario');

    // 2. RESETEO DE SECUENCIAS
    for (const sequenceName of SEQUENCES_TO_RESET) {
        await query(`ALTER SEQUENCE ${sequenceName} RESTART WITH 1`);
    }

    // 3. DATOS INICIALES MÍNIMOS
    // Insertar tipos
    await query("INSERT INTO tipo_usuario (nombre_tipo) VALUES ('Admin')");
    await query("INSERT INTO tipo_documento_tributario (codigo_sii, nombre_tipo) VALUES ('30', 'Factura')");
    await query("INSERT INTO tipo_categoria (nombre_categoria) VALUES ('Categoria Test')");

    // Insertar marca
    await query("INSERT INTO marca (nombre_marca) VALUES ('Marca Test')");

    // Insertar cliente (incluido el anónimo)
    await query("INSERT INTO cliente (rut, nombre_completo, telefono, correo, es_anonimo) VALUES ('11111111-1', 'Cliente Test', '+56911111111', 'test@test.com', false)");
    await query("INSERT INTO cliente (rut, nombre_completo, es_anonimo) VALUES ('99999999-9', 'Cliente Anónimo', true)");

    // Insertar usuario
    await query("INSERT INTO usuario (nombre, email, password, id_tipo) VALUES ('Usuario Test', 'test@stockly.cl', 'test123', 1)");
    
    // Insertar producto
    await query("INSERT INTO producto (sku, nombre, id_categoria, id_marca, precio_venta, precio_compra, descripcion, stock) VALUES ('SKU-TEST', 'Producto Test', 1, 1, 100, 50, 'Descripción Test', 10)");
    
    // Insertar compra
    await query("INSERT INTO compra (fecha, total, id_cliente, monto_tarjeta, monto_efectivo) VALUES (CURRENT_DATE, 100, 1, 100, 0)");
    
    // Insertar detalle_compra
    await query("INSERT INTO detalle_compra (sku, id_compra, cantidad, subtotal) VALUES ('SKU-TEST', 1, 1, 100)");
    
    // Insertar documento_tributario
    await query("INSERT INTO documento_tributario (id_compra, id_tipo) VALUES (1, '30')");
});