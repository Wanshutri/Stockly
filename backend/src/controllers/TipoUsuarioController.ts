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
// --- FUNCIONES DE UTILIDAD INTERNAS ---
// -------------------------------------------------------------------

/**
 * @function get_id_from_params
 * @description Analiza y valida el ID numérico a partir de los parámetros de la solicitud (`req.params.id`).
 * @param {Request} request El objeto de la solicitud de Express.
 * @returns {number | null} Retorna el ID como número si es válido, o `null` si no es un número válido.
 */
function get_id_from_params(request: Request): number | null {
    const raw_id = request.params.id;
    const parsed_id = Number(raw_id);
    return Number.isNaN(parsed_id) ? null : parsed_id;
}

/**
 * @function validate_type_name
 * @description Valida que el valor sea un string no vacío y lo normaliza (trim).
 * @param {unknown} value El valor a validar, generalmente proveniente de `req.body`.
 * @returns {string | null} Retorna el nombre limpio (trimmed) si es válido, o `null` si es inválido o vacío.
 */
function validate_type_name(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    if (!is_non_empty_string(value)) return null;
    return value.trim();
}

// -------------------------------------------------------------------
// --- CONTROLADORES CRUD ---
// -------------------------------------------------------------------

/**
 * @function create_tipo_usuario
 * @description Crea un nuevo tipo de usuario en la base de datos.
 * @param {Request} request El objeto de la solicitud de Express. Requiere `nombre_tipo` en `request.body`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 201 y el objeto creado, o 400 si falta `nombre_tipo`.
 */
export const create_tipo_usuario = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const nombre_tipo = validate_type_name(request.body.nombre_tipo);
        // Estandar HTTP: 400 Bad Request si la carga útil es inválida.
        if (!nombre_tipo) {
            return response.status(400).json({ message: 'El campo nombre_tipo es obligatorio y no debe estar vacío.' });
        }

        const insert_sql = `INSERT INTO tipo_usuario (nombre_tipo) VALUES ($1) RETURNING *`;
        const query_result = await query(insert_sql, [nombre_tipo]);

        const created_row = query_result.rows[0];
        // Estandar HTTP: 201 Created para la creación exitosa.
        return response.status(201).json(created_row);
    } catch (error) {
        // Manejo de error de unicidad (si existe) en PostgreSQL: Código '23505'
        const err = error as PgError;
        if (err.code === '23505') {
            return response.status(409).json({ message: 'Ya existe un tipo de usuario con ese nombre.' });
        }
        console.error('Error en create_tipo_usuario:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function get_tipo_usuarios
 * @description Obtiene todas las filas de la tabla `tipo_usuario`.
 * @param {Request} _request El objeto de la solicitud (no usado).
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y un array de tipos de usuario.
 */
export const get_tipo_usuarios = async (_request: Request, response: Response, next: NextFunction) => {
    try {
        const select_sql = `SELECT * FROM tipo_usuario ORDER BY nombre_tipo ASC`;
        const query_result = await query(select_sql);
        // Estandar HTTP: 200 OK para la obtención exitosa.
        return response.status(200).json(query_result.rows);
    } catch (error) {
        // Log solo en caso de error
        console.error('Error en get_tipo_usuarios:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function get_tipo_usuario_by_id
 * @description Obtiene un solo tipo de usuario por su ID.
 * @param {Request} request El objeto de la solicitud. Contiene el ID en `request.params.id`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y el objeto `tipo_usuario`, o 400/404 si hay errores.
 */
export const get_tipo_usuario_by_id = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const id_tipo = get_id_from_params(request);
        // Estandar HTTP: 400 Bad Request si el ID del parámetro es inválido.
        if (id_tipo === null) return response.status(400).json({ message: 'ID de tipo de usuario inválido.' });

        const select_sql = `SELECT * FROM tipo_usuario WHERE id_tipo=$1`;
        const query_result = await query(select_sql, [id_tipo]);

        const row = query_result.rows[0];
        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!row) return response.status(404).json({ message: 'Tipo de usuario no encontrado.' });

        // Estandar HTTP: 200 OK para la obtención exitosa.
        return response.status(200).json(row);
    } catch (error) {
        // Log solo en caso de error
        console.error('Error en get_tipo_usuario_by_id:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function update_tipo_usuario
 * @description Actualiza el nombre de un tipo de usuario por ID.
 * @param {Request} request El objeto de la solicitud. Contiene el ID en `request.params.id` y `nombre_tipo` en `request.body`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y el objeto actualizado, o 400/404 si hay errores.
 */
export const update_tipo_usuario = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const id_tipo = get_id_from_params(request);
        // Estandar HTTP: 400 Bad Request si el ID del parámetro es inválido.
        if (id_tipo === null) return response.status(400).json({ message: 'ID de tipo de usuario inválido.' });

        const nombre_tipo = validate_type_name(request.body.nombre_tipo);
        // Estandar HTTP: 400 Bad Request si la carga útil es inválida.
        if (!nombre_tipo) return response.status(400).json({ message: 'El campo nombre_tipo es obligatorio y no debe estar vacío.' });

        const update_sql = `UPDATE tipo_usuario SET nombre_tipo=$1 WHERE id_tipo=$2 RETURNING *`;
        const query_result = await query(update_sql, [nombre_tipo, id_tipo]);

        const updated_row = query_result.rows[0];
        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!updated_row) return response.status(404).json({ message: 'Tipo de usuario no encontrado.' });

        // Estandar HTTP: 200 OK para la actualización exitosa.
        return response.status(200).json(updated_row);
    } catch (error) {
        // Manejo de error de unicidad (si existe) en PostgreSQL: Código '23505'
        const err = error as PgError;
        if (err.code === '23505') {
            return response.status(409).json({ message: 'Ya existe un tipo de usuario con ese nombre.' });
        }
        console.error('Error en update_tipo_usuario:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function delete_tipo_usuario
 * @description Elimina un tipo de usuario por su ID, siguiendo el estándar REST (204 No Content).
 * @param {Request} request El objeto de la solicitud. Contiene el ID en `request.params.id`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 204 (No Content) si la eliminación es exitosa (sin cuerpo de respuesta), o 400/404/409 si hay errores.
 */
export const delete_tipo_usuario = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const id_tipo = get_id_from_params(request);
        // Estandar HTTP: 400 Bad Request si el ID del parámetro es inválido.
        if (id_tipo === null) return response.status(400).json({ message: 'ID de tipo de usuario inválido.' });

        const delete_sql = `DELETE FROM tipo_usuario WHERE id_tipo=$1 RETURNING id_tipo`;
        const query_result = await query(delete_sql, [id_tipo]);

        const deleted_row = query_result.rows[0];
        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!deleted_row) return response.status(404).json({ message: 'Tipo de usuario no encontrado.' });

        // Estandar HTTP: 204 No Content para la eliminación exitosa.
        return response.status(204).end();
    } catch (error) {
        const err = error as PgError;
        // 🚨 Manejo específico de Violación de Clave Foránea (PostgreSQL: '23503')
        if (err.code === '23503') {
            // Estandar HTTP: 409 Conflict cuando la solicitud choca con el estado del recurso (integridad de datos).
            return response.status(409).json({
                message: "No se puede eliminar el Tipo de Usuario porque todavía hay usuarios asociados a este tipo."
            });
        }
        // Para cualquier otro error (5xx, etc.), pasamos el control al middleware de errores.
        console.error('Error en delete_tipo_usuario:', error);
        next(error);
    }
};