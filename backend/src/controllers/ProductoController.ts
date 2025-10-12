import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_non_empty_string, is_positive_number } from '../utils/validators'; // is_positive_number ya está en snake_case

/**
 * Crear producto
 */
export const create_producto = async (request: Request, response: Response, next: NextFunction) => { // Función renombrada
  try {
    // Variables desestructuradas renombradas y acceso a body
    let { sku, nombre, id_categoria, id_marca, precio_venta, precio_compra, stock } = request.body; 

    // `isNonEmptyString` no es una función importada, asumo que debería ser `is_non_empty_string` (la que sí está importada)
    if (!is_non_empty_string(sku) || !is_non_empty_string(nombre)) {
      return response.status(400).json({ message: 'sku y nombre son obligatorios' });
    }

    sku = sku.trim();
    nombre = nombre.trim();

    // `isPositiveNumber` no es una función importada, asumo que debería ser `is_positive_number` (la que sí está importada)
    if (
      !is_positive_number(precio_venta) ||
      !is_positive_number(precio_compra) ||
      !is_positive_number(stock)
    ) {
      return response
        .status(400)
        .json({ message: 'precios y stock deben ser números no negativos' });
    }

    // Validar que el SKU sea único
    const exists = await query('SELECT 1 FROM producto WHERE sku = $1 LIMIT 1', [sku]);
    if ((exists?.rowCount ?? 0) > 0) {
      return response.status(409).json({ message: 'sku ya existe' });
    }

    // Alias en el SQL cambiados a snake_case o eliminados si la columna ya es snake_case
    const insert_sql = ` 
      INSERT INTO producto (
        sku, nombre, id_categoria, id_marca, precio_venta, precio_compra, stock
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING 
        sku, 
        nombre, 
        id_categoria, 
        id_marca, 
        precio_venta, 
        precio_compra, 
        stock
    `;

    // Variables de resultado y error renombradas
    const query_result = await query(insert_sql, [
      sku,
      nombre,
      id_categoria,
      id_marca,
      precio_venta,
      precio_compra,
      stock,
    ]);

    response.status(201).json(query_result.rows[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los productos
 */
export const get_productos = async (_request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    // Alias en el SQL cambiados a snake_case o eliminados
    const query_result = await query(`
      SELECT 
        sku, 
        nombre, 
        id_categoria, 
        id_marca, 
        precio_venta, 
        precio_compra, 
        stock
      FROM producto
    `); // Variable de resultado renombrada
    response.json(query_result.rows);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener producto por SKU
 */
export const get_producto_by_sku = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const { sku } = request.params; // Acceso a params renombrado
    
    // `isNonEmptyString` -> `is_non_empty_string`
    if (!is_non_empty_string(sku)) {
      return response.status(400).json({ message: 'sku inválido' });
    }

    // Alias en el SQL cambiados a snake_case o eliminados
    const query_result = await query(
      `
      SELECT 
        sku, 
        nombre, 
        id_categoria, 
        id_marca, 
        precio_venta, 
        precio_compra, 
        stock
      FROM producto 
      WHERE sku = $1
      `,
      [sku]
    ); // Variable de resultado renombrada

    const producto = query_result.rows[0];
    if (!producto) {
      return response.status(404).json({ message: 'Producto no encontrado' });
    }

    response.json(producto);
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar producto por SKU
 */
export const update_producto = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const { sku } = request.params;
    
    // `isNonEmptyString` -> `is_non_empty_string`
    if (!is_non_empty_string(sku)) {
      return response.status(400).json({ message: 'sku inválido' });
    }

    // Variables desestructuradas renombradas y acceso a body
    const { nombre, id_categoria, id_marca, precio_venta, precio_compra, stock } = request.body;

    const set: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (nombre !== undefined) {
      // `isNonEmptyString` -> `is_non_empty_string`
      if (!is_non_empty_string(nombre)) {
        return response.status(400).json({ message: 'nombre no puede ser vacío' });
      }
      set.push(`nombre = $${idx++}`);
      params.push(nombre.trim());
    }

    // idCategoria -> id_categoria
    if (id_categoria !== undefined) {
      set.push(`id_categoria = $${idx++}`);
      params.push(id_categoria);
    }

    // idMarca -> id_marca
    if (id_marca !== undefined) {
      set.push(`id_marca = $${idx++}`);
      params.push(id_marca);
    }

    // precioVenta -> precio_venta
    if (precio_venta !== undefined) {
      // `isPositiveNumber` -> `is_positive_number`
      if (!is_positive_number(precio_venta)) {
        return response.status(400).json({ message: 'precio_venta inválido' });
      }
      set.push(`precio_venta = $${idx++}`);
      params.push(precio_venta);
    }

    // precioCompra -> precio_compra
    if (precio_compra !== undefined) {
      // `isPositiveNumber` -> `is_positive_number`
      if (!is_positive_number(precio_compra)) {
        return response.status(400).json({ message: 'precio_compra inválido' });
      }
      set.push(`precio_compra = $${idx++}`);
      params.push(precio_compra);
    }

    if (stock !== undefined) {
      // `isPositiveNumber` -> `is_positive_number`
      if (!is_positive_number(stock)) {
        return response.status(400).json({ message: 'stock inválido' });
      }
      set.push(`stock = $${idx++}`);
      params.push(stock);
    }

    if (set.length === 0) {
      return response.status(400).json({ message: 'No hay campos para actualizar' });
    }

    // Alias en el SQL cambiados a snake_case o eliminados
    const update_sql = `
      UPDATE producto
      SET ${set.join(', ')}
      WHERE sku = $${idx}
      RETURNING 
        sku, 
        nombre, 
        id_categoria, 
        id_marca, 
        precio_venta, 
        precio_compra, 
        stock
    `; // Variable SQL renombrada

    params.push(sku);

    const query_result = await query(update_sql, params); // Variable de resultado renombrada
    const updated = query_result.rows[0];

    if (!updated) {
      return response.status(404).json({ message: 'Producto no encontrado' });
    }

    response.json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar producto por SKU
 */
export const delete_producto = async (request: Request, response: Response, next: NextFunction) => { // Función y parámetros renombrados
  try {
    const { sku } = request.params;

    // `isNonEmptyString` -> `is_non_empty_string`
    if (!is_non_empty_string(sku)) {
      return response.status(400).json({ message: 'sku inválido' });
    }

    // Alias en el SQL cambiados a snake_case o eliminados
    const query_result = await query(
      `
      DELETE FROM producto 
      WHERE sku = $1 
      RETURNING 
        sku, 
        nombre, 
        id_categoria, 
        id_marca, 
        precio_venta, 
        precio_compra, 
        stock
      `,
      [sku]
    ); // Variable de resultado renombrada

    const deleted = query_result.rows[0];
    if (!deleted) {
      return response.status(404).json({ message: 'Producto no encontrado' });
    }

    response.json(deleted);
  } catch (error) {
    next(error);
  }
};