import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_positive_number } from '../utils/validators'; // Importación renombrada

/**
 * Crear un nuevo documento tributario.
 */
export const create_documento = async (request: Request, response: Response, next: NextFunction) => { // Función renombrada
    try {
        // Variables desestructuradas renombradas y acceso a body
        const { id_compra, id_tipo } = request.body; 
        
        if (id_compra === undefined || id_tipo === undefined) {
            return response.status(400).json({ message: 'id_compra e id_tipo son obligatorios' });
        }

        // Validación de existencia de Compra
        const compra_exists_query = 'SELECT 1 FROM compra WHERE id_compra=$1 LIMIT 1'; // SQL renombrado
        const compra_result = await query(compra_exists_query, [id_compra]); // Variable renombrada
        if ((compra_result?.rowCount ?? 0) === 0) {
            return response.status(400).json({ message: 'Compra no existe' });
        }

        // Validación de existencia de TipoDocumentoTributario
        const tipo_exists_query = 'SELECT 1 FROM tipo_documento_tributario WHERE id_tipo=$1 LIMIT 1'; // SQL renombrado
        const tipo_result = await query(tipo_exists_query, [id_tipo]); // Variable renombrada
        if ((tipo_result?.rowCount ?? 0) === 0) {
            return response.status(400).json({ message: 'TipoDocumento no existe' });
        }

        // Inserción del documento
        // SQL renombrado: 'DocumentoTributario' -> 'documento_tributario', 'idCompra' -> 'id_compra', 'idTipo' -> 'id_tipo'
        const insert_sql = 'INSERT INTO documento_tributario (id_compra, id_tipo) VALUES ($1, $2) RETURNING *';
        const query_result = await query(insert_sql, [id_compra, id_tipo]); // Variable renombrada
        
        response.status(201).json(query_result.rows[0]);
    } catch (error) { // Variable de error renombrada
        next(error);
    }
};

/**
 * Obtener todos los documentos tributarios.
 */
export const get_documentos = async (_request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
    try {
        // SQL renombrado: 'DocumentoTributario' -> 'documento_tributario'
        const select_sql = 'SELECT * FROM documento_tributario';
        const query_result = await query(select_sql); // Variable de resultado renombrada
        
        response.json(query_result.rows);
    } catch (error) {
        next(error);
    }
};

/**
 * Obtener un documento por ID.
 */
export const get_documento_by_id = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
    try {
        const id_documento = Number(request.params.id); // Variable renombrada
        
        if (Number.isNaN(id_documento)) {
            return response.status(400).json({ message: 'id inválido' });
        }

        // SQL renombrado: 'DocumentoTributario' -> 'documento_tributario', 'idDocumento' -> 'id_documento'
        const select_sql = 'SELECT * FROM documento_tributario WHERE id_documento=$1';
        const query_result = await query(select_sql, [id_documento]); // Variable de resultado renombrada
        
        const row = query_result.rows[0];
        
        if (!row) {
            return response.status(404).json({ message: 'Documento no encontrado' });
        }
        
        response.json(row);
    } catch (error) {
        next(error);
    }
};

/**
 * Eliminar un documento por ID.
 */
export const delete_documento = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
    try {
        const id_documento = Number(request.params.id); // Variable renombrada
        
        if (Number.isNaN(id_documento)) {
            return response.status(400).json({ message: 'id inválido' });
        }

        // SQL renombrado: 'DocumentoTributario' -> 'documento_tributario', 'idDocumento' -> 'id_documento'
        const delete_sql = 'DELETE FROM documento_tributario WHERE id_documento=$1 RETURNING *';
        const query_result = await query(delete_sql, [id_documento]); // Variable de resultado renombrada
        
        const deleted_row = query_result.rows[0]; // Variable renombrada
        
        if (!deleted_row) {
            return response.status(404).json({ message: 'Documento no encontrado' });
        }
        
        response.json(deleted_row);
    } catch (error) {
        next(error);
    }
};