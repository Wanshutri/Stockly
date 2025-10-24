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
 * @function create_tipo_documento
 * @description Crea un nuevo tipo de documento tributario en la base de datos.
 * @param {Request} request El objeto de la solicitud de Express. Requiere `codigo_sii` y `nombre_tipo` en `request.body`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 201 y el objeto creado, o 400/409 si hay errores.
 */
export const create_tipo_documento = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {        

        // Estandar HTTP: 400 Bad Request si la carga útil es inválida.
        // Comprobar undefined o empty string
        if (!is_non_empty_string(request.body.nombre_tipo)) {
            return response.status(400).json({ message: 'El campo nombre_tipo es obligatorio y no debe estar vacío.' });
        }

        // Comprobar SII
        if (!is_non_empty_string(request.body.codigo_sii)) {
            return response.status(400).json({ message: 'El campo codigo_sii es obligatorio y no debe estar vacío.' });
        }
        const nombre_tipo : string = request.body.nombre_tipo.trim();
        const codigo_sii : Number = request.body.codigo_sii;

        const insert_sql = `
            INSERT INTO tipo_documento_tributario (codigo_sii, nombre_tipo)
            VALUES ($1, $2)
            RETURNING *
        `;

        const query_result = await query(insert_sql, [codigo_sii, nombre_tipo]);
        // Estandar HTTP: 201 Created para la creación exitosa.
        return response.status(201).json(query_result.rows[0]);
    } catch (error) {
        // Log solo en caso de error
        console.error('Error en create_tipo_documento:', error);
        // Manejo de error de unicidad (PostgreSQL: Código '23505')
        const err = error as PgError;
        if (err.code === '23505') {
            return response.status(409).json({ message: 'Ya existe un tipo de documento tributario con ese código SII.' });
        }
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function get_tipo_documentos
 * @description Obtiene todas las filas de la tabla `tipo_documento_tributario`.
 * @param {Request} _request El objeto de la solicitud (no usado).
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y un array de tipos de documento.
 */
export const get_tipo_documentos = async (
    _request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        const select_sql = `SELECT * FROM tipo_documento_tributario ORDER BY nombre_tipo ASC`;
        const query_result = await query(select_sql);
        // Estandar HTTP: 200 OK para la obtención exitosa.
        return response.status(200).json(query_result.rows);
    } catch (error) {
        // Log solo en caso de error
        console.error('Error en get_tipo_documentos:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function get_tipo_documento_by_id
 * @description Obtiene un solo tipo de documento tributario por su código SII.
 * @param {Request} request El objeto de la solicitud. Contiene el código en `request.params.id`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y el objeto `tipo_documento_tributario`, o 400/404 si hay errores.
 */
export const get_tipo_documento_by_id = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        // El parámetro 'id' ahora es 'codigo_sii'
        const codigo_sii = request.params.id;
        // Estandar HTTP: 400 Bad Request si el código del parámetro es inválido.
        if (codigo_sii === null) return response.status(400).json({ message: 'Código SII inválido.' });

        const select_sql = `
            SELECT * FROM tipo_documento_tributario
            WHERE codigo_sii = $1
        `;

        const query_result = await query(select_sql, [codigo_sii]);
        const row = query_result.rows[0];

        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!row) {
            return response.status(404).json({ message: 'Tipo de documento no encontrado.' });
        }

        // Estandar HTTP: 200 OK para la obtención exitosa.
        return response.status(200).json(row);
    } catch (error) {
        // Log solo en caso de error
        console.error('Error en get_tipo_documento_by_id:', error);
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function update_tipo_documento
 * @description Actualiza el nombre de un tipo de documento tributario por código SII.
 * @param {Request} request El objeto de la solicitud. Contiene el código en `request.params.id` y `nombre_tipo` en `request.body`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y el objeto actualizado, o 400/404/409 si hay errores.
 */
export const update_tipo_documento = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        // El parámetro 'id' ahora es 'codigo_sii'
        const codigo_sii = request.params.id;
        // Estandar HTTP: 400 Bad Request si el código del parámetro es inválido.
        if (codigo_sii === null) return response.status(400).json({ message: 'Código SII inválido.' });
        
        // Estandar HTTP: 400 Bad Request si la carga útil es inválida.
        // Comprobar undefined o empty string
        if (!is_non_empty_string(request.body.nombre_tipo)) {
            return response.status(400).json({ message: 'El campo nombre_tipo es obligatorio y no debe estar vacío.' });
        }

        // Comprobar SII
        if (!is_non_empty_string(codigo_sii)) {
            return response.status(400).json({ message: 'El codigo_sii es obligatorio y no debe estar vacío.' });
        }
        const nombre_tipo : string = request.body.nombre_tipo.trim();

        const update_sql = `
            UPDATE tipo_documento_tributario
            SET nombre_tipo = $1
            WHERE codigo_sii = $2
            RETURNING *
        `;

        const query_result = await query(update_sql, [nombre_tipo, codigo_sii]);
        const updated_row = query_result.rows[0];

        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!updated_row) {
            return response.status(404).json({ message: 'Tipo de documento no encontrado.' });
        }

        // Estandar HTTP: 200 OK para la actualización exitosa.
        return response.status(200).json(updated_row);
    } catch (error) {
        // Log solo en caso de error
        console.error('Error en update_tipo_documento:', error);
        // Manejo de error de unicidad (PostgreSQL: Código '23505')
        const err = error as PgError;
        // Solo el nombre_tipo puede causar unicidad si se aplica una restricción UNIQUE a esa columna
        if (err.code === '23505') {
            return response.status(409).json({ message: 'Ya existe un tipo de documento tributario con ese nombre.' });
        }
        next(error);
    }
};

// -------------------------------------------------------------------

/**
 * @function delete_tipo_documento
 * @description Elimina un tipo de documento tributario por su código SII, siguiendo el estándar REST (204 No Content).
 * @param {Request} request El objeto de la solicitud. Contiene el código en `request.params.id`.
 * @param {Response} response El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 204 (No Content) si la eliminación es exitosa (sin cuerpo de respuesta), o 400/404/409 si hay errores.
 */
export const delete_tipo_documento = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    try {
        // El parámetro 'id' ahora es 'codigo_sii'
        const codigo_sii = request.params.id;
        // Estandar HTTP: 400 Bad Request si el código del parámetro es inválido.
        if (codigo_sii === null) return response.status(400).json({ message: 'Código SII inválido.' });

        const delete_sql = `
            DELETE FROM tipo_documento_tributario
            WHERE codigo_sii = $1
            RETURNING codigo_sii
        `;

        const query_result = await query(delete_sql, [codigo_sii]);
        const deleted_row = query_result.rows[0];

        // Estandar HTTP: 404 Not Found si el recurso no existe.
        if (!deleted_row) {
            return response.status(404).json({ message: 'Tipo de documento no encontrado.' });
        }

        // Estandar HTTP: 204 No Content para la eliminación exitosa.
        return response.status(204).end();
    } catch (error) {
        // Log solo en caso de error
        console.error('Error en delete_tipo_documento:', error);

        const err = error as PgError;
        // 🚨 Manejo específico de Violación de Clave Foránea (PostgreSQL: '23503')
        if (err.code === '23503') {
            // Se asume que la restricción es con otra tabla que referencia codigo_sii
            // Estandar HTTP: 409 Conflict cuando la solicitud choca con el estado del recurso (integridad de datos).
            return response.status(409).json({
                message: "No se puede eliminar el Tipo de Documento Tributario porque todavía existen referencias a este código."
            });
        }
        // Para cualquier otro error (5xx, etc.), pasamos el control al middleware de errores.
        next(error);
    }
};