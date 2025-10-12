import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';

/**
 * Crear cliente a través de un procedimiento almacenado.
 */
export const create_cliente = async (request: Request, response: Response, next: NextFunction) => { // Función renombrada
  try {
    // Variables desestructuradas renombradas y acceso a body
    const { nombre, email, telefono } = request.body; 
    
    // SQL renombrado: 'create_cliente' (asumo que la función PL/pgSQL es 'create_cliente')
    const insert_sql = 'SELECT * FROM create_cliente($1, $2, $3)'; 
    const query_result = await query(insert_sql, [nombre, email, telefono]); // Variable de resultado renombrada
    
    const row = query_result.rows[0];
    return response.status(201).json(row);
  } catch (error: any) { // Variable de error renombrada
    // 23505 es unique_violation (conflicto de email)
    if (error && error.code === '23505') {
      return response.status(409).json({ message: 'email ya registrado' });
    }
    // Manejo de errores personalizados de PostgreSQL (ERRCODE '45000')
    if (error && error.code === '45000') {
      return response.status(400).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Obtener todos los clientes.
 */
export const get_clientes = async (_request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const select_sql = 'SELECT * FROM cliente';
    const query_result = await query(select_sql);
    response.json(query_result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener cliente por ID.
 */
export const get_cliente_by_id = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const id_cliente = Number(request.params.id); // Variable renombrada
    
    if (Number.isNaN(id_cliente)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    // SQL renombrado: 'idCliente' -> 'id_cliente'
    const select_sql = 'SELECT * FROM cliente WHERE id_cliente = $1'; 
    const query_result = await query(select_sql, [id_cliente]);
    
    const cliente = query_result.rows[0];
    
    if (!cliente) {
      return response.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    response.json(cliente);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar cliente a través de un procedimiento almacenado.
 */
export const update_cliente = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const id_cliente = Number(request.params.id); // Variable renombrada
    
    if (Number.isNaN(id_cliente)) {
      return response.status(400).json({ message: 'id inválido' });
    }

    const { nombre, email, telefono } = request.body;
    
    // SQL renombrado: 'update_cliente' (asumo que la función PL/pgSQL es 'update_cliente')
    const update_sql = 'SELECT * FROM update_cliente($1, $2, $3, $4)'; 
    const query_result = await query(update_sql, [id_cliente, nombre, email, telefono]);
    
    const updated_row = query_result.rows[0]; // Variable renombrada
    
    if (!updated_row) {
      return response.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    response.json(updated_row);
  } catch (error: any) {
    if (error && error.code === '23505') {
      return response.status(409).json({ message: 'email ya registrado' });
    }
    if (error && error.code === '45000') {
      return response.status(400).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Eliminar cliente a través de un procedimiento almacenado.
 */
export const delete_cliente = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const id_cliente = Number(request.params.id); // Variable renombrada
    
    if (Number.isNaN(id_cliente)) {
      return response.status(400).json({ message: 'id inválido' });
    }
    
    // SQL renombrado: 'delete_cliente' (asumo que la función PL/pgSQL es 'delete_cliente')
    const delete_sql = 'SELECT * FROM delete_cliente($1)';
    const query_result = await query(delete_sql, [id_cliente]);
    
    const deleted_row = query_result.rows[0]; // Variable renombrada
    
    if (!deleted_row) {
      return response.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    response.json(deleted_row);
  } catch (error: any) {
    if (error && error.code === '45000') {
      return response.status(400).json({ message: error.message });
    }
    next(error);
  }
};

/**
 * Obtener cliente por email.
 */
export const get_cliente_by_email = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const email = String(request.body.email).trim().toLowerCase();
    
    if (!email) {
      return response.status(400).json({ message: 'Email inválido' });
    }

    const select_sql = 'SELECT * FROM cliente WHERE email = $1';
    const query_result = await query(select_sql, [email]);
    
    const cliente = query_result.rows[0];
    
    if (!cliente) {
      return response.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    response.json(cliente);
  } catch (error) {
    next(error);
  }
};