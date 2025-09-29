import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isNonEmptyString, isPositiveNumber } from '../utils/validators';

export const createProducto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { sku, nombre, idCategoria, idMarca, precioVenta, precioCompra, stock } = req.body;
    if (!isNonEmptyString(sku) || !isNonEmptyString(nombre)) return res.status(400).json({ message: 'sku y nombre son obligatorios' });
    sku = sku.trim(); nombre = nombre.trim();
    if (!isPositiveNumber(precioVenta) || !isPositiveNumber(precioCompra) || !isPositiveNumber(stock)) return res.status(400).json({ message: 'precios y stock deben ser números no negativos' });

    // Check sku uniqueness
    const exists = await query('SELECT 1 FROM Producto WHERE sku = $1 LIMIT 1', [sku]);
    if ((exists?.rowCount ?? 0) > 0) return res.status(409).json({ message: 'sku ya existe' });

    const sql = `INSERT INTO Producto (sku, nombre, idCategoria, idMarca, precioVenta, precioCompra, stock) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const result = await query(sql, [sku, nombre, idCategoria, idMarca, precioVenta, precioCompra, stock]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const getProductos = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query('SELECT * FROM Producto');
    res.json(result.rows);
  } catch (err) { next(err); }
};

export const getProductoBySku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;
    if (!isNonEmptyString(sku)) return res.status(400).json({ message: 'sku inválido' });
    const result = await query('SELECT * FROM Producto WHERE sku = $1', [sku]);
    const row = result.rows[0];
    if (!row) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(row);
  } catch (err) { next(err); }
};

export const updateProducto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;
    if (!isNonEmptyString(sku)) return res.status(400).json({ message: 'sku inválido' });
    const { nombre, idCategoria, idMarca, precioVenta, precioCompra, stock } = req.body;
    const set: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (nombre !== undefined) { if (!isNonEmptyString(nombre)) return res.status(400).json({ message: 'nombre no puede ser vacío' }); set.push(`nombre=$${idx++}`); params.push(nombre.trim()); }
    if (idCategoria !== undefined) { set.push(`idCategoria=$${idx++}`); params.push(idCategoria); }
    if (idMarca !== undefined) { set.push(`idMarca=$${idx++}`); params.push(idMarca); }
    if (precioVenta !== undefined) { if (!isPositiveNumber(precioVenta)) return res.status(400).json({ message: 'precioVenta inválido' }); set.push(`precioVenta=$${idx++}`); params.push(precioVenta); }
    if (precioCompra !== undefined) { if (!isPositiveNumber(precioCompra)) return res.status(400).json({ message: 'precioCompra inválido' }); set.push(`precioCompra=$${idx++}`); params.push(precioCompra); }
    if (stock !== undefined) { if (!isPositiveNumber(stock)) return res.status(400).json({ message: 'stock inválido' }); set.push(`stock=$${idx++}`); params.push(stock); }
    if (set.length === 0) return res.status(400).json({ message: 'No hay campos para actualizar' });
    const sql = `UPDATE Producto SET ${set.join(', ')} WHERE sku = $${idx} RETURNING *`;
    params.push(sku);
    const result = await query(sql, params);
    const updated = result.rows[0];
    if (!updated) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(updated);
  } catch (err) { next(err); }
};

export const deleteProducto = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;
    if (!isNonEmptyString(sku)) return res.status(400).json({ message: 'sku inválido' });
    const result = await query('DELETE FROM Producto WHERE sku = $1 RETURNING *', [sku]);
    const deleted = result.rows[0];
    if (!deleted) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(deleted);
  } catch (err) { next(err); }
};
