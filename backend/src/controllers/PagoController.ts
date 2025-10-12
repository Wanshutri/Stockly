import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_positive_number } from '../utils/validators'; // Importación renombrada

/**
 * Crear un nuevo registro de pago.
 */
export const create_pago = async (request: Request, response: Response, next: NextFunction) => {
  try {
    // Variables desestructuradas y default renombradas
    const { monto_efectivo = 0, monto_tarjeta = 0 } = request.body; 
    
    // Función de validación renombrada y mensaje de error JSON actualizado
    if (!is_positive_number(monto_efectivo) || !is_positive_number(monto_tarjeta)) {
      return response.status(400).json({ message: 'montos inválidos' });
    }

    // SQL renombrado: 'Pago' -> 'pago', 'montoEfectivo' -> 'monto_efectivo', 'montoTarjeta' -> 'monto_tarjeta'
    const insert_sql = `
      INSERT INTO pago (monto_efectivo, monto_tarjeta) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    
    const query_result = await query(insert_sql, [monto_efectivo, monto_tarjeta]);
    
    // Variable de resultado renombrada
    response.status(201).json(query_result.rows[0]);
  } catch (error) { // Variable de error renombrada
    next(error);
  }
};

/**
 * Obtener todos los registros de pago.
 */
export const get_pagos = async (_request: Request, response: Response, next: NextFunction) => {
  try {
    // SQL renombrado: 'Pago' -> 'pago'
    const select_sql = 'SELECT * FROM pago'; 
    const query_result = await query(select_sql);
    
    response.json(query_result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener un pago por ID.
 */
export const get_pago_by_id = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id_pago = Number(request.params.id); // Variable renombrada
    
    // 'Number.isNaN' permanece en camelCase ya que es parte de la API estándar de JavaScript.
    if (Number.isNaN(id_pago)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    // SQL renombrado: 'Pago' -> 'pago', 'idPago' -> 'id_pago'
    const select_sql = 'SELECT * FROM pago WHERE id_pago = $1'; 
    const query_result = await query(select_sql, [id_pago]);
    
    const row = query_result.rows[0];
    
    if (!row) {
      return response.status(404).json({ message: 'Pago no encontrado' });
    }
    
    response.json(row);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar un pago por ID.
 */
export const delete_pago = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id_pago = Number(request.params.id); // Variable renombrada
    
    if (Number.isNaN(id_pago)) {
      return response.status(400).json({ message: 'id inválido' });
    }
    
    // SQL renombrado: 'Pago' -> 'pago', 'idPago' -> 'id_pago'
    const delete_sql = 'DELETE FROM pago WHERE id_pago = $1 RETURNING *';
    const query_result = await query(delete_sql, [id_pago]);
    
    const deleted_row = query_result.rows[0]; // Variable renombrada
    
    if (!deleted_row) {
      return response.status(404).json({ message: 'Pago no encontrado' });
    }
    
    response.json(deleted_row);
  } catch (error) {
    next(error);
  }
};