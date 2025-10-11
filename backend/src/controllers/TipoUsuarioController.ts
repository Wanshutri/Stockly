import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isNonEmptyString } from '../utils/validators';

/**
 * Parse and validate id from request params.
 * Returns a number id or null if invalid.
 */
function get_id_from_params(req: Request): number | null {
  const raw_id = req.params.id;
  const parsed_id = Number(raw_id);
  return Number.isNaN(parsed_id) ? null : parsed_id;
}

/**
 * Validate the provided type name.
 * Returns the trimmed name or null if invalid.
 */
function validate_type_name(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (!isNonEmptyString(value)) return null;
  return value.trim();
}

/**
 * Create a new tipo_usuario
 */
export const create_tipo_usuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type_name = validate_type_name(req.body.nombre_tipo);
    if (!type_name) {
      return res.status(400).json({ message: 'nombre_tipo es obligatorio' });
    }

    const insert_sql = `INSERT INTO tipo_usuario (nombre_tipo) VALUES ($1) RETURNING *`;
    const query_result = await query(insert_sql, [type_name]);

    const created_row = query_result.rows[0];
    return res.status(201).json(created_row);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all tipo_usuario rows
 */
export const get_tipo_usuarios = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const select_sql = `SELECT * FROM tipo_usuario`;
    const query_result = await query(select_sql);
    return res.json(query_result.rows);
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single tipo_usuario by id
 */
export const get_tipo_usuario_by_id = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = get_id_from_params(req);
    if (id === null) return res.status(400).json({ message: 'id inválido' });

    const select_sql = `SELECT * FROM tipo_usuario WHERE id_tipo=$1`;
    const query_result = await query(select_sql, [id]);

    const row = query_result.rows[0];
    if (!row) return res.status(404).json({ message: 'tipo_usuario no encontrado' });

    return res.json(row);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a tipo_usuario by id
 */
export const update_tipo_usuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = get_id_from_params(req);
    if (id === null) return res.status(400).json({ message: 'id inválido' });

    const type_name = validate_type_name(req.body.nombre_tipo);
    if (!type_name) return res.status(400).json({ message: 'nombre_tipo es obligatorio' });

    const update_sql = `UPDATE tipo_usuario SET nombre_tipo=$1 WHERE id_tipo=$2 RETURNING *`;
    const query_result = await query(update_sql, [type_name, id]);

    const updated_row = query_result.rows[0];
    if (!updated_row) return res.status(404).json({ message: 'tipo_usuario no encontrado' });

    return res.json(updated_row);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a tipo_usuario by id
 */
export const delete_tipo_usuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = get_id_from_params(req);
    if (id === null) return res.status(400).json({ message: 'id inválido' });

    const delete_sql = `DELETE FROM tipo_usuario WHERE id_tipo=$1 RETURNING *`;
    const query_result = await query(delete_sql, [id]);

    const deleted_row = query_result.rows[0];
    if (!deleted_row) return res.status(404).json({ message: 'tipo_usuario no encontrado' });

    return res.json(deleted_row);
  } catch (err) {
    next(err);
  }
};
