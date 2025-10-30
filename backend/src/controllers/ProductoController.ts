// Importaciones de módulos y tipos
import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_non_empty_string, is_positive_number } from '../utils/validators';

// -------------------------------------------------------------------
// --- TIPADO PARA ERRORES DE POSTGRES ---
// -------------------------------------------------------------------
// Definición de una interfaz básica para errores de PostgreSQL que tienen un código
interface PgError extends Error {
    code?: string;
    detail?: string;
    constraint?: string;
}

// -------------------------------------------------------------------
// --- CONTROLADORES CRUD ---
// -------------------------------------------------------------------

/**
 * @function create_producto
 * @description Crea un nuevo producto en la base de datos.
 * @param {Request} request El objeto de la solicitud. Requiere `sku`, `nombre`, `descripcion`, `precio_venta`, `precio_compra`, `stock`, `id_categoria` y `id_marca` en `request.body`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 201 y el objeto creado, o 400/409 si hay errores.
 */
export const create_producto = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        let { sku, nombre, id_categoria, id_marca, precio_venta, precio_compra, descripcion, stock } = request.body;

        // Estandar HTTP: 400 Bad Request si la carga útil es inválida.
        if (
            !is_non_empty_string(sku) || 
            !is_non_empty_string(nombre) || 
            !is_non_empty_string(descripcion)
        ) {
            return response.status(400).json({ message: 'Los campos SKU, nombre y descripcion son obligatorios y no deben estar vacíos.' });
        }

        sku = sku.trim();
        nombre = nombre.trim();
        descripcion = descripcion.trim();

        // **IMPORTANTE**: id_categoria y id_marca son NOT NULL según tu esquema.
        if (!id_categoria || !id_marca) {
             return response.status(400).json({ message: 'id_categoria e id_marca son obligatorios y no deben ser nulos.' });
        }

        // Estandar HTTP: 400 Bad Request si la carga útil es inválida.
        if (
            !is_positive_number(precio_venta) ||
            !is_positive_number(precio_compra) ||
            !is_positive_number(stock)
        ) {
            return response
                .status(400)
                .json({ message: 'Los campos precio_venta, precio_compra y stock deben ser números positivos (o cero).' });
        }
        
        const insert_sql = ` 
            INSERT INTO producto (
                sku, nombre, id_categoria, id_marca, precio_venta, precio_compra, descripcion, stock
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING 
                sku, 
                nombre, 
                id_categoria, 
                id_marca, 
                precio_venta, 
                precio_compra, 
                descripcion,
                stock
        `;

        const query_result = await query(insert_sql, [
            sku,
            nombre,
            id_categoria, // Ya no se permite null
            id_marca,     // Ya no se permite null
            precio_venta,
            precio_compra,
            descripcion,
            stock,
        ]);

        // Estandar HTTP: 201 Created para la creación exitosa.
        response.status(201).json(query_result.rows[0]);

    } catch (error) {
        

        const err = error as PgError;

        // Manejo de error de unicidad (PostgreSQL: Código '23505')
        if (err.code === '23505') {
            return response.status(409).json({ message: 'Ya existe un producto con ese SKU.' });
        }

        // Manejo de error de clave foránea (PostgreSQL: Código '23503')
        if (err.code === '23503') {
            if (err.constraint === 'producto_id_categoria_fkey') {
                return response.status(409).json({ message: 'La categoría (id_categoria) proporcionada no existe.' });
            }
            if (err.constraint === 'producto_id_marca_fkey') {
                return response.status(409).json({ message: 'La marca (id_marca) proporcionada no existe.' });
            }
            return response.status(409).json({ message: 'Referencia a clave foránea inválida.' });
        }
        
        // Manejo de error NOT NULL (PostgreSQL: Código '23502') - Relevante si faltó un valor obligatorio
        if (err.code === '23502') {
             return response.status(400).json({ 
                message: 'Faltan campos obligatorios como id_categoria, id_marca, precio_venta, precio_compra, descripcion o stock.' 
            });
        }

        // Log solo en caso de error
        console.error('Error en create_producto:', error);

        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function get_productos
 * @description Obtiene todos los productos de la base de datos, ordenados por nombre.
 * @param {Request} _request El objeto de la solicitud (no usado).
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y un array de productos.
 */
export const get_productos = async (
    _request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const select_sql = `
            SELECT 
                sku, 
                nombre, 
                id_categoria, 
                id_marca, 
                precio_venta, 
                precio_compra, 
                descripcion,
                stock
            FROM producto
            ORDER BY nombre ASC
        `;

        const query_result = await query(select_sql);

        // Estandar HTTP: 200 OK para la obtención exitosa.
        response.status(200).json(query_result.rows);
    } catch (error) {
        // Log solo en caso de error
        console.error('Error en get_productos:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function get_producto_by_sku
 * @description Obtiene un solo producto por su SKU (string).
 * @param {Request} request El objeto de la solicitud. Contiene el SKU en `request.params.sku`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y el objeto `producto`, o 400/404 si hay errores.
 */
export const get_producto_by_sku = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { sku } = request.params;

        // Estandar HTTP: 400 Bad Request si el SKU del parámetro es inválido.
        if (!is_non_empty_string(sku)) {
            return response.status(400).json({ message: 'El parámetro SKU es inválido o está vacío.' });
        }

        const select_sql = `
            SELECT 
                sku, 
                nombre, 
                id_categoria, 
                id_marca, 
                precio_venta, 
                precio_compra, 
                descripcion,
                stock
            FROM producto 
            WHERE sku = $1
        `;

        const query_result = await query(select_sql, [sku]);

        const producto = query_result.rows[0];

        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!producto) {
            return response.status(404).json({ message: 'Producto no encontrado.' });
        }

        // Estandar HTTP: 200 OK para la obtención exitosa.
        response.status(200).json(producto);
    } catch (error) {
        // Log solo en caso de error
        console.error('Error en get_producto_by_sku:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function update_producto
 * @description Actualiza los campos de un producto por su SKU.
 * @param {Request} request El objeto de la solicitud. Contiene el SKU en `request.params.sku` y los campos a actualizar en `request.body`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y el objeto actualizado, o 400/404/409 si hay errores.
 */
export const update_producto = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { sku } = request.params;

        // Estandar HTTP: 400 Bad Request si el SKU del parámetro es inválido.
        if (!is_non_empty_string(sku)) {
            return response.status(400).json({ message: 'El parámetro SKU es inválido o está vacío.' });
        }

        const { nombre, id_categoria, id_marca, precio_venta, precio_compra, descripcion, stock } = request.body;

        const set_clauses: string[] = [];
        const params: any[] = [];
        let param_index = 1;

        // Lógica de construcción dinámica del UPDATE

        if (nombre !== undefined) {
            if (!is_non_empty_string(nombre)) {
                return response.status(400).json({ message: 'El campo nombre no puede ser una cadena vacía.' });
            }
            set_clauses.push(`nombre = $${param_index++}`);
            params.push(nombre.trim());
        }
        
        if (descripcion !== undefined) {
            if (!is_non_empty_string(descripcion)) {
                return response.status(400).json({ message: 'El campo descripcion no puede ser una cadena vacía.' });
            }
            set_clauses.push(`descripcion = $${param_index++}`);
            params.push(descripcion.trim());
        }

        if (id_categoria !== undefined) {
            // Ya que es NOT NULL, si se envía debe ser un valor válido (no nulo, la FK se encarga del resto)
            set_clauses.push(`id_categoria = $${param_index++}`);
            params.push(id_categoria);
        }

        if (id_marca !== undefined) {
            // Ya que es NOT NULL, si se envía debe ser un valor válido (no nulo, la FK se encarga del resto)
            set_clauses.push(`id_marca = $${param_index++}`);
            params.push(id_marca);
        }

        if (precio_venta !== undefined) {
            if (!is_positive_number(precio_venta)) {
                return response.status(400).json({ message: 'precio_venta debe ser un número positivo (o cero).' });
            }
            set_clauses.push(`precio_venta = $${param_index++}`);
            params.push(precio_venta);
        }

        if (precio_compra !== undefined) {
            if (!is_positive_number(precio_compra)) {
                return response.status(400).json({ message: 'precio_compra debe ser un número positivo (o cero).' });
            }
            set_clauses.push(`precio_compra = $${param_index++}`);
            params.push(precio_compra);
        }

        if (stock !== undefined) {
            if (!is_positive_number(stock)) {
                return response.status(400).json({ message: 'stock debe ser un número positivo (o cero).' });
            }
            set_clauses.push(`stock = $${param_index++}`);
            params.push(stock);
        }

        // Estandar HTTP: 400 Bad Request si no se envía nada para actualizar.
        if (set_clauses.length === 0) {
            return response.status(400).json({ message: 'No se proporcionaron campos para actualizar.' });
        }

        const update_sql = `
            UPDATE producto
            SET ${set_clauses.join(', ')}
            WHERE sku = $${param_index}
            RETURNING 
                sku, 
                nombre, 
                id_categoria, 
                id_marca, 
                precio_venta, 
                precio_compra, 
                descripcion,
                stock
        `;

        params.push(sku); // Añadir el SKU al final para el WHERE

        const query_result = await query(update_sql, params);
        const updated_producto = query_result.rows[0];

        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!updated_producto) {
            return response.status(404).json({ message: 'Producto no encontrado.' });
        }

        // Estandar HTTP: 200 OK para la actualización exitosa.
        response.status(200).json(updated_producto);

    } catch (error) {

        const err = error as PgError;

        // Manejo de error de clave foránea (PostgreSQL: Código '23503')
        if (err.code === '23503') {
            if (err.constraint === 'producto_id_categoria_fkey') {
                return response.status(409).json({ message: 'La categoría (id_categoria) proporcionada no existe.' });
            }
            if (err.constraint === 'producto_id_marca_fkey') {
                return response.status(409).json({ message: 'La marca (id_marca) proporcionada no existe.' });
            }
            return response.status(409).json({ message: 'Referencia a clave foránea inválida.' });
        }
        
        // Manejo de error NOT NULL (PostgreSQL: Código '23502')
        if (err.code === '23502') {
             return response.status(400).json({ 
                message: 'No se puede actualizar el producto a un valor nulo en un campo obligatorio (como id_categoria o id_marca).' 
            });
        }

        // Log solo en caso de error
        console.error('Error en update_producto:', error);

        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function delete_producto
 * @description Elimina un producto por su SKU (string).
 * @param {Request} request El objeto de la solicitud. Contiene el SKU en `request.params.sku`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 204 (No Content) si la eliminación es exitosa, o 400/404/409 si hay errores.
 */
export const delete_producto = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const { sku } = request.params;

        // Estandar HTTP: 400 Bad Request si el SKU del parámetro es inválido.
        if (!is_non_empty_string(sku)) {
            return response.status(400).json({ message: 'El parámetro SKU es inválido o está vacío.' });
        }

        const delete_sql = `
            DELETE FROM producto 
            WHERE sku = $1 
            RETURNING sku
        `;

        const query_result = await query(delete_sql, [sku]);
        const deleted_producto = query_result.rows[0];

        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!deleted_producto) {
            return response.status(404).json({ message: 'Producto no encontrado.' });
        }

        // Estandar HTTP: 204 No Content para la eliminación exitosa.
        response.status(204).end();

    } catch (error) {
        
        const err = error as PgError;
        
        // 🚨 Manejo específico de Violación de Clave Foránea (PostgreSQL: '23503')
        if (err.code === '23503') {
            // Estandar HTTP: 409 Conflict.
            return response.status(409).json({
                message: "No se puede eliminar el producto porque todavía existen ventas u otras entidades que lo referencian."
            });
        }
        console.error('Error en delete_producto:', error);
        
        next(error);
    }
};