import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_non_empty_string } from '../utils/validators';

/**
 * Analiza y valida el ID de los parámetros de la solicitud.
 * Retorna un id de tipo número o null si es inválido.
 */
function get_id_from_params(request: Request): number | null {
  const raw_id = request.params.id;
  const parsed_id = Number(raw_id);
  // 'Number.isNaN' permanece en camelCase ya que es parte de la API estándar de JavaScript.
  return Number.isNaN(parsed_id) ? null : parsed_id;
}

/**
 * Valida el nombre del tipo proporcionado.
 * Retorna el nombre recortado o null si es inválido.
 */
function validate_type_name(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (!is_non_empty_string(value)) return null;
  return value.trim();
}

// ---

/**
 * Crea un nuevo tipo_usuario
 */
export const create_tipo_usuario = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const nombre_tipo = validate_type_name(request.body.nombre_tipo);
    if (!nombre_tipo) {
      // El mensaje de error JSON utiliza snake_case para 'nombre_tipo'
      return response.status(400).json({ message: 'nombre_tipo es obligatorio' });
    }

    // La variable SQL utiliza snake_case
    const insert_sql = `INSERT INTO tipo_usuario (nombre_tipo) VALUES ($1) RETURNING *`;
    // La variable de resultado utiliza snake_case
    const query_result = await query(insert_sql, [nombre_tipo]);

    // La variable y el acceso al resultado (rows[0]) utilizan snake_case
    const created_row = query_result.rows[0];
    // El resultado JSON (created_row) contendrá campos en snake_case si así están en la base de datos
    return response.status(201).json(created_row);
  } catch (error) {
    next(error);
  }
};

// ---

/**
 * Obtiene todas las filas de tipo_usuario
 */
export const get_tipo_usuarios = async (_request: Request, response: Response, next: NextFunction) => {
  try {
    // La variable SQL utiliza snake_case
    const select_sql = `SELECT * FROM tipo_usuario`;
    // La variable de resultado utiliza snake_case
    const query_result = await query(select_sql);
    // El resultado JSON utiliza snake_case
    return response.json(query_result.rows);
  } catch (error) {
    next(error);
  }
};

// ---

/**
 * Obtiene un solo tipo_usuario por ID
 */
export const get_tipo_usuario_by_id = async (request: Request, response: Response, next: NextFunction) => {
  try {
    // La variable 'id_tipo' utiliza snake_case
    const id_tipo = get_id_from_params(request);
    if (id_tipo === null) return response.status(400).json({ message: 'id inválido' });

    // La variable SQL y el campo de la consulta utilizan snake_case
    const select_sql = `SELECT * FROM tipo_usuario WHERE id_tipo=$1`;
    // La variable de resultado utiliza snake_case
    const query_result = await query(select_sql, [id_tipo]);

    // La variable 'row' utiliza snake_case
    const row = query_result.rows[0];
    if (!row) return response.status(404).json({ message: 'tipo_usuario no encontrado' });

    // El resultado JSON utiliza snake_case
    return response.json(row);
  } catch (error) {
    next(error);
  }
};

// ---

/**
 * Actualiza un tipo_usuario por ID
 */
export const update_tipo_usuario = async (request: Request, response: Response, next: NextFunction) => {
  try {
    // La variable 'id_tipo' utiliza snake_case
    const id_tipo = get_id_from_params(request);
    if (id_tipo === null) return response.status(400).json({ message: 'id inválido' });

    // La variable 'nombre_tipo' utiliza snake_case
    const nombre_tipo = validate_type_name(request.body.nombre_tipo);
    // El mensaje de error JSON utiliza snake_case para 'nombre_tipo'
    if (!nombre_tipo) return response.status(400).json({ message: 'nombre_tipo es obligatorio' });

    // La variable SQL y los campos de la consulta utilizan snake_case
    const update_sql = `UPDATE tipo_usuario SET nombre_tipo=$1 WHERE id_tipo=$2 RETURNING *`;
    // La variable de resultado utiliza snake_case
    const query_result = await query(update_sql, [nombre_tipo, id_tipo]);

    // La variable 'updated_row' utiliza snake_case
    const updated_row = query_result.rows[0];
    if (!updated_row) return response.status(404).json({ message: 'tipo_usuario no encontrado' });

    // El resultado JSON utiliza snake_case
    return response.json(updated_row);
  } catch (error) {
    next(error);
  }
};

// ---

/**
 * Elimina un tipo_usuario por ID
 */
export const delete_tipo_usuario = async (request: Request, response: Response, next: NextFunction) => {
  try {
    // La variable 'id_tipo' utiliza snake_case
    const id_tipo = get_id_from_params(request);
    if (id_tipo === null) return response.status(400).json({ message: 'id inválido' });

    // La variable SQL y el campo de la consulta utilizan snake_case
    const delete_sql = `DELETE FROM tipo_usuario WHERE id_tipo=$1 RETURNING *`;
    // La variable de resultado utiliza snake_case
    const query_result = await query(delete_sql, [id_tipo]);

    // La variable 'deleted_row' utiliza snake_case
    const deleted_row = query_result.rows[0];
    if (!deleted_row) return response.status(404).json({ message: 'tipo_usuario no encontrado' });

    // El resultado JSON utiliza snake_case
    return response.status(204).json(deleted_row);
  } catch (error) {
    next(error);
  }
};