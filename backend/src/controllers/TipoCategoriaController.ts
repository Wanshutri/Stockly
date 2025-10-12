import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_non_empty_string } from '../utils/validators';

/**
 * Crear tipo de categoría
 */
export const create_tipo_categoria = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    let { nombre_categoria } = request.body;

    if (!is_non_empty_string(nombre_categoria)) {
      return response.status(400).json({ message: 'nombre_categoria es obligatorio' });
    }

    nombre_categoria = nombre_categoria.trim();

    const insert_sql = `
      INSERT INTO tipo_categoria (nombre_categoria) 
      VALUES ($1) 
      RETURNING id_categoria, nombre_categoria
    `;

    const query_result = await query(insert_sql, [nombre_categoria]);

    response.status(201).json(query_result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los tipos de categoría
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
    `;
    
    const query_result = await query(select_sql);
    response.json(query_result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener tipo de categoría por ID
 */
export const get_tipo_categoria_by_id = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const id_categoria = Number(request.params.id);

    if (Number.isNaN(id_categoria)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    const select_sql = `
      SELECT id_categoria, nombre_categoria 
      FROM tipo_categoria 
      WHERE id_categoria = $1
    `;

    const query_result = await query(select_sql, [id_categoria]);

    const tipo_categoria = query_result.rows[0];

    if (!tipo_categoria) {
      return response.status(404).json({ message: 'Tipo de categoría no encontrada' });
    }

    response.json(tipo_categoria);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar tipo de categoría
 */
export const update_tipo_categoria = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const id_categoria = Number(request.params.id);

    if (Number.isNaN(id_categoria)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    let { nombre_categoria } = request.body;

    if (!is_non_empty_string(nombre_categoria)) {
      return response.status(400).json({ message: 'nombre_categoria es obligatorio' });
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

    if (!updated_tipo_categoria) {
      return response.status(404).json({ message: 'Tipo de categoría no encontrada' });
    }

    response.json(updated_tipo_categoria);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar tipo de categoría
 */
export const delete_tipo_categoria = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const id_categoria = Number(request.params.id);

    if (Number.isNaN(id_categoria)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    const delete_sql = `
      DELETE FROM tipo_categoria 
      WHERE id_categoria = $1 
      RETURNING id_categoria, nombre_categoria
    `;

    const query_result = await query(delete_sql, [id_categoria]);

    const deleted_tipo_categoria = query_result.rows[0];

    if (!deleted_tipo_categoria) {
      return response.status(404).json({ message: 'Tipo de categoría no encontrada' });
    }

    response.json(deleted_tipo_categoria);
  } catch (error) {
    next(error);
  }
};