import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_positive_number, is_non_empty_string } from '../utils/validators'; // Importaciones renombradas

/**
 * Crear un nuevo detalle de compra.
 */
export const create_detalle_compra = async (request: Request, response: Response, next: NextFunction) => { // Función renombrada
  try {
    // Variables desestructuradas renombradas y acceso a body
    const { sku, id_compra, cantidad, subtotal } = request.body; 

    // Funciones de validación renombradas
    if (!is_non_empty_string(sku) || id_compra === undefined || !is_positive_number(cantidad) || !is_positive_number(subtotal)) {
      return response.status(400).json({ message: 'campos inválidos' });
    }
    
    const product_sku = sku.trim(); // Variable renombrada
    
    // --- Validar existencia de Producto ---
    // SQL renombrado: 'Producto' -> 'producto'
    const product_exists_sql = 'SELECT 1 FROM producto WHERE sku=$1 LIMIT 1';
    const product_result = await query(product_exists_sql, [product_sku]); // Variable renombrada
    if ((product_result?.rowCount ?? 0) === 0) {
      return response.status(400).json({ message: 'Producto no existe' });
    }
    
    // --- Validar existencia de Compra ---
    // SQL renombrado: 'Compra' -> 'compra', 'idCompra' -> 'id_compra'
    const compra_exists_sql = 'SELECT 1 FROM compra WHERE id_compra=$1 LIMIT 1';
    const compra_result = await query(compra_exists_sql, [id_compra]); // Variable renombrada
    if ((compra_result?.rowCount ?? 0) === 0) {
      return response.status(400).json({ message: 'Compra no existe' });
    }

    // --- Inserción de DetalleCompra ---
    // SQL renombrado: 'DetalleCompra' -> 'detalle_compra', 'idCompra' -> 'id_compra'
    const insert_sql = 'INSERT INTO detalle_compra (sku, id_compra, cantidad, subtotal) VALUES ($1, $2, $3, $4) RETURNING *';
    const query_result = await query(insert_sql, [product_sku, id_compra, cantidad, subtotal]); // Variables renombradas
    
    response.status(201).json(query_result.rows[0]);
  } catch (error) { // Variable de error renombrada
    next(error);
  }
};

/**
 * Obtener todos los detalles de compra.
 */
export const get_detalle_compra = async (_request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    // SQL renombrado: 'DetalleCompra' -> 'detalle_compra'
    const select_sql = 'SELECT * FROM detalle_compra';
    const query_result = await query(select_sql); // Variable de resultado renombrada
    
    response.json(query_result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un detalle de compra por SKU e ID de Compra (Clave compuesta).
 */
export const delete_detalle_compra = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    // Variables desestructuradas renombradas y acceso a params
    const { sku, id_compra } = request.params; 
    
    // Función de validación renombrada
    if (!is_non_empty_string(sku) || Number.isNaN(Number(id_compra))) {
      return response.status(400).json({ message: 'identificadores inválidos' });
    }
    
    const numeric_id_compra = Number(id_compra); // Variable auxiliar

    // SQL renombrado: 'DetalleCompra' -> 'detalle_compra', 'idCompra' -> 'id_compra'
    const delete_sql = 'DELETE FROM detalle_compra WHERE sku=$1 AND id_compra=$2 RETURNING *';
    const query_result = await query(delete_sql, [sku, numeric_id_compra]); // Variable de resultado renombrada
    
    const deleted_row = query_result.rows[0]; // Variable renombrada
    
    if (!deleted_row) {
      return response.status(404).json({ message: 'Detalle no encontrado' });
    }
    
    response.json(deleted_row);
  } catch (error) {
    next(error);
  }
};