import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_non_empty_string } from '../utils/validators'; // Importación renombrada

/**
 * Crear marca
 */
export const create_marca = async (request: Request, response: Response, next: NextFunction) => { // Función renombrada
  try {
    let { nombre_marca } = request.body; // Acceso a body renombrado
    
    // Función de validación renombrada
    if (!is_non_empty_string(nombre_marca)) { 
      return response.status(400).json({ message: 'nombre_marca es obligatorio' });
    }
    
    nombre_marca = nombre_marca.trim();

    const insert_sql = 'INSERT INTO marca (nombre_marca) VALUES ($1) RETURNING id_marca'; // Variable SQL renombrada
    const query_result = await query(insert_sql, [nombre_marca]); // Variable de resultado renombrada

    // El objeto de respuesta JSON utiliza snake_case
    response.status(201).json({ id_marca: query_result.rows[0].id_marca, nombre_marca });
  } catch (error) { // Variable de error renombrada
    next(error);
  }
};

/**
 * Obtener todas las marcas
 */
export const get_marcas = async (_request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const select_sql = 'SELECT * FROM marca ORDER BY id_marca'; // Variable SQL renombrada
    const query_result = await query(select_sql); // Variable de resultado renombrada
    response.json(query_result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener marca por id
 */
export const get_marca_by_id = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const id_marca = Number(request.params.id); // Variable renombrada y acceso a params
    
    // 'Number.isNaN' permanece en camelCase ya que es parte de la API estándar de JavaScript.
    if (Number.isNaN(id_marca)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    const select_sql = 'SELECT * FROM marca WHERE id_marca=$1'; // Variable SQL renombrada
    const query_result = await query(select_sql, [id_marca]); // Variable de resultado renombrada
    
    const row = query_result.rows[0];
    
    if (!row) {
      return response.status(404).json({ message: 'Marca no encontrada' });
    }

    response.json(row);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar marca
 */
export const update_marca = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const id_marca = Number(request.params.id); // Variable renombrada y acceso a params
    
    if (Number.isNaN(id_marca)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    let { nombre_marca } = request.body; // Acceso a body renombrado
    
    // Función de validación renombrada
    if (!is_non_empty_string(nombre_marca)) {
      return response.status(400).json({ message: 'nombre_marca es obligatorio' });
    }
    
    nombre_marca = nombre_marca.trim();

    // Validar existencia
    const exists = await query('SELECT 1 FROM marca WHERE id_marca=$1', [id_marca]);
    
    if (exists.rowCount === 0) {
      return response.status(404).json({ message: 'Marca no encontrada' });
    }

    // Actualizar
    const update_sql = 'UPDATE marca SET nombre_marca=$1 WHERE id_marca=$2 RETURNING *'; // Variable SQL renombrada
    const query_result = await query(update_sql, [nombre_marca, id_marca]); // Variable de resultado renombrada

    response.json(query_result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar marca
 */
export const delete_marca = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const id_marca = Number(request.params.id); // Variable renombrada y acceso a params
    
    if (Number.isNaN(id_marca)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    try {
      const delete_sql = 'SELECT * FROM eliminar_marca($1)'; // Variable SQL renombrada
      const query_result = await query(delete_sql, [id_marca]); // Variable de resultado renombrada

      const deleted = query_result.rows[0];
      // El objeto de respuesta JSON utiliza snake_case
      response.json({ id_marca: deleted.id_marca, nombre_marca: deleted.nombre_marca }); 

    } catch (error: any) { // Variable de error renombrada
      // Captura las excepciones de PostgreSQL
      if (error.code === 'NO_DATA_FOUND') {
        return response.status(404).json({ message: 'Marca no encontrada' });
      }
      if (error.code === '23503') { // 'foreign_key_violation' se puede mapear a su código SQLSTATE '23503' o dejar el nombre literal
        return response.status(400).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};