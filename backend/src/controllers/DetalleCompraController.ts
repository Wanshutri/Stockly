import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isPositiveNumber, isNonEmptyString } from '../utils/validators';

export const createDetalleCompra = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku, idCompra, cantidad, subtotal } = req.body;
    if (!isNonEmptyString(sku) || idCompra === undefined || !isPositiveNumber(cantidad) || !isPositiveNumber(subtotal)) return res.status(400).json({ message: 'campos inválidos' });
    const s = sku.trim();
    // check producto and compra exist
    const prod = await query('SELECT 1 FROM Producto WHERE sku=$1 LIMIT 1', [s]);
    if ((prod?.rowCount ?? 0) === 0) return res.status(400).json({ message: 'Producto no existe' });
    const comp = await query('SELECT 1 FROM Compra WHERE idCompra=$1 LIMIT 1', [idCompra]);
    if ((comp?.rowCount ?? 0) === 0) return res.status(400).json({ message: 'Compra no existe' });

    const result = await query('INSERT INTO DetalleCompra (sku,idCompra,cantidad,subtotal) VALUES ($1,$2,$3,$4) RETURNING *', [s, idCompra, cantidad, subtotal]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

export const getDetalleCompra = async (_req: Request, res: Response, next: NextFunction) => { try { const result = await query('SELECT * FROM DetalleCompra'); res.json(result.rows); } catch (err) { next(err); } };

export const deleteDetalleCompra = async (req: Request, res: Response, next: NextFunction) => { try { const { sku, idCompra } = req.params; if (!isNonEmptyString(sku) || Number.isNaN(Number(idCompra))) return res.status(400).json({ message: 'identificadores inválidos' }); const result = await query('DELETE FROM DetalleCompra WHERE sku=$1 AND idCompra=$2 RETURNING *', [sku, Number(idCompra)]); const deleted = result.rows[0]; if (!deleted) return res.status(404).json({ message: 'Detalle no encontrado' }); res.json(deleted); } catch (err) { next(err); } };
