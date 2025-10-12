import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_valid_date, is_positive_number } from '../utils/validators'; // Importaciones renombradas

/**
 * Crea un nuevo registro de compra y su pago asociado.
 */
export const create_compra = async (request: Request, response: Response, next: NextFunction) => { // Función renombrada
  try {
    // Variables desestructuradas renombradas y acceso a body
    const { fecha, total, id_cliente, monto_efectivo, monto_tarjeta } = request.body; 
    
    // Funciones de validación renombradas y mensaje de error JSON actualizado
    if (!is_valid_date(fecha) || !is_positive_number(total) || id_cliente === undefined) {
      return response.status(400).json({ message: 'fecha, total e id_cliente son obligatorios' });
    }

    try {
      // Llamada a la función SQL con parámetros renombrados
      const select_sql = 'SELECT * FROM create_compra($1, $2, $3, $4, $5)';
      const query_result = await query(select_sql, [fecha, total, id_cliente, monto_efectivo, monto_tarjeta]);
      
      const created_row = query_result.rows[0]; // Variable renombrada
      return response.status(201).json(created_row);
    } catch (error: any) { // Captura de error
      // Manejo de errores personalizados de PostgreSQL (ej: RAISE EXCEPTION)
      if (error && error.code === '45000') {
        return response.status(400).json({ message: error.message });
      }
      throw error;
    }
  } catch (error) { // Variable de error renombrada
    next(error);
  }
};

/**
 * Obtiene todos los registros de compra.
 */
export const get_compras = async (_request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    // SQL renombrado: 'Compra' -> 'compra'
    const select_sql = 'SELECT * FROM compra'; 
    const query_result = await query(select_sql); // Variable de resultado renombrada
    response.json(query_result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene una compra por ID.
 */
export const get_compra_by_id = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const id_compra = Number(request.params.id); // Variable renombrada
    
    if (Number.isNaN(id_compra)) {
      return response.status(400).json({ message: 'id inválido' });
    }
    
    // SQL renombrado: 'Compra' -> 'compra', 'idCompra' -> 'id_compra'
    const select_sql = 'SELECT * FROM compra WHERE id_compra=$1';
    const query_result = await query(select_sql, [id_compra]); // Variable de resultado renombrada
    
    const row = query_result.rows[0];
    
    if (!row) {
      return response.status(404).json({ message: 'Compra no encontrada' });
    }
    
    response.json(row);
  } catch (error) {
    next(error);
  }
};

/**
 * Elimina una compra por ID.
 */
export const delete_compra = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const id_compra = Number(request.params.id); // Variable renombrada
    
    if (Number.isNaN(id_compra)) {
      return response.status(400).json({ message: 'id inválido' });
    }
    
    // SQL renombrado: 'Compra' -> 'compra', 'idCompra' -> 'id_compra'
    const delete_sql = 'DELETE FROM compra WHERE id_compra=$1 RETURNING *';
    const query_result = await query(delete_sql, [id_compra]); // Variable de resultado renombrada
    
    const deleted_row = query_result.rows[0]; // Variable renombrada
    
    if (!deleted_row) {
      return response.status(404).json({ message: 'Compra no encontrada' });
    }
    
    response.json(deleted_row);
  } catch (error) {
    next(error);
  }
};