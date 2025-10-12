import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_non_empty_string } from '../utils/validators';

/**
 * Crear un nuevo tipo de documento tributario
 */
export const create_tipo_documento = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    // Las variables 'req', 'res' se renombran a 'request', 'response'
    let { nombre_tipo } = request.body; // 'req.body' a 'request.body'

    if (!is_non_empty_string(nombre_tipo)) {
      // El mensaje de error JSON utiliza snake_case para 'nombre_tipo'
      return response.status(400).json({ message: 'nombre_tipo es obligatorio' });
    }

    nombre_tipo = nombre_tipo.trim();

    // La variable SQL utiliza snake_case
    const insert_sql = `
      INSERT INTO tipo_documento_tributario (nombre_tipo)
      VALUES ($1)
      RETURNING *
    `;

    // La variable de resultado utiliza snake_case
    const query_result = await query(insert_sql, [nombre_tipo]); // 'result' renombrado a 'query_result'
    // El resultado JSON utiliza snake_case
    response.status(201).json(query_result.rows[0]);
  } catch (error) { // 'err' renombrado a 'error'
    next(error);
  }
};

/**
 * Obtener todos los tipos de documento tributario
 */
export const get_tipo_documentos = async (
  _request: Request, // 'req' renombrado a '_request' (se ignora)
  response: Response, // 'res' renombrado a 'response'
  next: NextFunction
) => {
  try {
    // La variable SQL utiliza snake_case
    const select_sql = `SELECT * FROM tipo_documento_tributario`;
    // La variable de resultado utiliza snake_case
    const query_result = await query(select_sql); // 'result' renombrado a 'query_result'
    // El resultado JSON utiliza snake_case
    response.json(query_result.rows);
  } catch (error) { // 'err' renombrado a 'error'
    next(error);
  }
};

/**
 * Obtener un tipo de documento tributario por ID
 */
export const get_tipo_documento_by_id = async (
  request: Request, // 'req' renombrado a 'request'
  response: Response, // 'res' renombrado a 'response'
  next: NextFunction
) => {
  try {
    // La variable 'id_tipo' utiliza snake_case
    const id_tipo = Number(request.params.id); // 'req.params' a 'request.params'

    // 'Number.isNaN' permanece en camelCase ya que es parte de la API estándar de JavaScript.
    if (Number.isNaN(id_tipo)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    // La variable SQL y el campo de la consulta utilizan snake_case
    const select_sql = `
      SELECT * FROM tipo_documento_tributario
      WHERE id_tipo = $1
    `;

    // La variable de resultado utiliza snake_case
    const query_result = await query(select_sql, [id_tipo]); // 'result' renombrado a 'query_result'
    // La variable 'row' utiliza snake_case
    const row = query_result.rows[0];

    if (!row) {
      return response.status(404).json({ message: 'tipo_documento no encontrado' });
    }

    // El resultado JSON utiliza snake_case
    response.json(row);
  } catch (error) { // 'err' renombrado a 'error'
    next(error);
  }
};

/**
 * Actualizar un tipo de documento tributario
 */
export const update_tipo_documento = async (
  request: Request, // 'req' renombrado a 'request'
  response: Response, // 'res' renombrado a 'response'
  next: NextFunction
) => {
  try {
    // La variable 'id_tipo' utiliza snake_case
    const id_tipo = Number(request.params.id); // 'req.params' a 'request.params'

    if (Number.isNaN(id_tipo)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    let { nombre_tipo } = request.body; // 'req.body' a 'request.body'

    if (!is_non_empty_string(nombre_tipo)) {
      // El mensaje de error JSON utiliza snake_case para 'nombre_tipo'
      return response.status(400).json({ message: 'nombre_tipo es obligatorio' });
    }

    nombre_tipo = nombre_tipo.trim();

    // La variable SQL y los campos de la consulta utilizan snake_case
    const update_sql = `
      UPDATE tipo_documento_tributario
      SET nombre_tipo = $1
      WHERE id_tipo = $2
      RETURNING *
    `;

    // La variable de resultado utiliza snake_case
    const query_result = await query(update_sql, [nombre_tipo, id_tipo]); // 'result' renombrado a 'query_result'
    // La variable 'updated_row' utiliza snake_case
    const updated_row = query_result.rows[0]; // 'updated' renombrado a 'updated_row'

    if (!updated_row) {
      return response.status(404).json({ message: 'tipo_documento no encontrado' });
    }

    // El resultado JSON utiliza snake_case
    response.json(updated_row);
  } catch (error) { // 'err' renombrado a 'error'
    next(error);
  }
};

/**
 * Eliminar un tipo de documento tributario
 */
export const delete_tipo_documento = async (
  request: Request, // 'req' renombrado a 'request'
  response: Response, // 'res' renombrado a 'response'
  next: NextFunction
) => {
  try {
    // La variable 'id_tipo' utiliza snake_case
    const id_tipo = Number(request.params.id); // 'req.params' a 'request.params'

    if (Number.isNaN(id_tipo)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    // La variable SQL y el campo de la consulta utilizan snake_case
    const delete_sql = `
      DELETE FROM tipo_documento_tributario
      WHERE id_tipo = $1
      RETURNING *
    `;

    // La variable de resultado utiliza snake_case
    const query_result = await query(delete_sql, [id_tipo]); // 'result' renombrado a 'query_result'
    // La variable 'deleted_row' utiliza snake_case
    const deleted_row = query_result.rows[0]; // 'deleted' renombrado a 'deleted_row'

    if (!deleted_row) {
      return response.status(404).json({ message: 'tipo_documento no encontrado' });
    }

    // El resultado JSON utiliza snake_case
    response.json(deleted_row);
  } catch (error) { // 'err' renombrado a 'error'
    next(error);
  }
};