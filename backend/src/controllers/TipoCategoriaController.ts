// Importaciones de módulos y tipos
import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_non_empty_string } from '../utils/validators';

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
 * @function create_tipo_categoria
 * @description Crea un nuevo tipo de categoría en la base de datos.
 * @param {Request} request El objeto de la solicitud de Express. Requiere `nombre_categoria` en `request.body`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 201 y el objeto creado, o 400/409 si hay errores.
 */
export const create_tipo_categoria = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        let { nombre_categoria } = request.body;

        // Estandar HTTP: 400 Bad Request si la carga útil es inválida.
        if (!is_non_empty_string(nombre_categoria)) {
            return response.status(400).json({ message: 'El campo nombre_categoria es obligatorio y no debe estar vacío.' });
        }

        nombre_categoria = nombre_categoria.trim();

        const insert_sql = `
            INSERT INTO tipo_categoria (nombre_categoria) 
            VALUES ($1) 
            RETURNING id_categoria, nombre_categoria
        `;

        const query_result = await query(insert_sql, [nombre_categoria]);

        // Estandar HTTP: 201 Created para la creación exitosa.
        return response.status(201).json(query_result.rows[0]);
    } catch (error) {
        
        
        // ========= ¡AQUÍ ESTÁ LA LÓGICA! =========
        // Manejo de error de unicidad (PostgreSQL: Código '23505')
        const err = error as PgError;
        if (err.code === '23505') {
            // Estandar HTTP: 409 Conflict si el nombre ya existe.
            return response.status(409).json({ message: 'Ya existe un tipo de categoría con ese nombre.' });
        }
        // ===========================================
        // Log solo en caso de error
        console.error('Error en create_tipo_categoria:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function get_tipo_categorias
 * @description Obtiene todas las filas de la tabla `tipo_categoria`.
 * @param {Request} _request El objeto de la solicitud (no usado).
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y un array de tipos de categoría.
 */
export const get_tipo_categorias = async (
    _request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const select_sql = `
            SELECT id_categoria, nombre_categoria 
            FROM tipo_categoria
            ORDER BY nombre_categoria ASC
        `;
        
        const query_result = await query(select_sql);
        // Estandar HTTP: 200 OK para la obtención exitosa.
        return response.status(200).json(query_result.rows);
    } catch (error) {
        // Log solo en caso de error
        console.error('Error en get_tipo_categorias:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function get_tipo_categoria_by_id
 * @description Obtiene un solo tipo de categoría por su ID (numérico).
 * @param {Request} request El objeto de la solicitud. Contiene el ID en `request.params.id`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y el objeto `tipo_categoria`, o 400/404 si hay errores.
 */
export const get_tipo_categoria_by_id = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        // El 'id' del parámetro es el id_categoria (numérico)
        const id_categoria = Number(request.params.id);

        // Estandar HTTP: 400 Bad Request si el ID del parámetro es inválido.
        if (Number.isNaN(id_categoria)) {
            return response.status(400).json({ message: 'ID de categoría inválido.' });
        }

        const select_sql = `
            SELECT id_categoria, nombre_categoria 
            FROM tipo_categoria 
            WHERE id_categoria = $1
        `;

        const query_result = await query(select_sql, [id_categoria]);
        const tipo_categoria = query_result.rows[0];

        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!tipo_categoria) {
            return response.status(404).json({ message: 'Tipo de categoría no encontrado.' });
        }

        // Estandar HTTP: 200 OK para la obtención exitosa.
        return response.status(200).json(tipo_categoria);
    } catch (error) {
        // Log solo en caso de error
        console.error('Error en get_tipo_categoria_by_id:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function update_tipo_categoria
 * @description Actualiza el nombre de un tipo de categoría por su ID.
 * @param {Request} request El objeto de la solicitud. Contiene el ID en `request.params.id` y `nombre_categoria` en `request.body`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y el objeto actualizado, o 400/404/409 si hay errores.
 */
export const update_tipo_categoria = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        // El 'id' del parámetro es el id_categoria (numérico)
        const id_categoria = Number(request.params.id);

        // Estandar HTTP: 400 Bad Request si el ID del parámetro es inválido.
        if (Number.isNaN(id_categoria)) {
            return response.status(400).json({ message: 'ID de categoría inválido.' });
        }

        // El 'nombre_categoria' del body es el nombre *nuevo*
        let { nombre_categoria } = request.body;

        // Estandar HTTP: 400 Bad Request si la carga útil es inválida.
        if (!is_non_empty_string(nombre_categoria)) {
            return response.status(400).json({ message: 'El campo nombre_categoria es obligatorio y no debe estar vacío.' });
        }

        nombre_categoria = nombre_categoria.trim();

        const update_sql = `
            UPDATE tipo_categoria 
            SET nombre_categoria = $1 
            WHERE id_categoria = $2 
            RETURNING id_categoria, nombre_categoria
        `;

        const query_result = await query(update_sql, [nombre_categoria, id_categoria]);
        const updated_tipo_categoria = query_result.rows[0];

        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!updated_tipo_categoria) {
            return response.status(404).json({ message: 'Tipo de categoría no encontrado.' });
        }

        // Estandar HTTP: 200 OK para la actualización exitosa.
        return response.status(200).json(updated_tipo_categoria);
    } catch (error) {
        
        
        // ========= ¡AQUÍ ESTÁ LA LÓGICA! =========
        // Manejo de error de unicidad (PostgreSQL: Código '23505')
        const err = error as PgError;
        if (err.code === '23505') {
            // Estandar HTTP: 409 Conflict si el nombre ya existe.
            return response.status(409).json({ message: 'Ya existe un tipo de categoría con ese nombre.' });
        }
        // ===========================================
        // Log solo en caso de error
        console.error('Error en update_tipo_categoria:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function delete_tipo_categoria
 * @description Elimina un tipo de categoría por su ID (numérico).
 * @param {Request} request El objeto de la solicitud. Contiene el ID en `request.params.id`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 204 (No Content) si la eliminación es exitosa, o 400/404/409 si hay errores.
 */
export const delete_tipo_categoria = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        // El 'id' del parámetro es el id_categoria (numérico)
        const id_categoria = Number(request.params.id);

        // Estandar HTTP: 400 Bad Request si el ID del parámetro es inválido.
        if (Number.isNaN(id_categoria)) {
            return response.status(400).json({ message: 'ID de categoría inválido.' });
        }

        const delete_sql = `
            DELETE FROM tipo_categoria 
            WHERE id_categoria = $1 
            RETURNING id_categoria
        `;

        const query_result = await query(delete_sql, [id_categoria]);
        const deleted_tipo_categoria = query_result.rows[0];

        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!deleted_tipo_categoria) {
            return response.status(404).json({ message: 'Tipo de categoría no encontrado.' });
        }

        // Estandar HTTP: 204 No Content para la eliminación exitosa.
        return response.status(204).end();
    } catch (error) {
        

        const err = error as PgError;
        // 🚨 Manejo específico de Violación de Clave Foránea (PostgreSQL: '23503')
        if (err.code === '23503') {
            // Asumimos que 'producto' referencia 'id_categoria'
            // Estandar HTTP: 409 Conflict.
            return response.status(409).json({
                message: "No se puede eliminar el Tipo de Categoría porque todavía existen productos u otras entidades que la referencian."
            });
        }
        // Para cualquier otro error (5xx, etc.), pasamos el control al middleware de errores.
        // Log solo en caso de error
        console.error('Error en delete_tipo_categoria:', error);
        next(error);
    }
};

