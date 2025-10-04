import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isValidDate, isPositiveNumber } from '../utils/validators';

export const createCompra = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha, total, idCliente, montoEfectivo, montoTarjeta } = req.body;
    if (!isValidDate(fecha) || !isPositiveNumber(total) || idCliente === undefined) return res.status(400).json({ message: 'fecha, total e idCliente son obligatorios' });

    try {
      const result = await query('SELECT * FROM create_compra($1,$2,$3,$4,$5)', [fecha, total, idCliente, montoEfectivo, montoTarjeta]);
      const created = result.rows[0];
      return res.status(201).json(created);
    } catch (err: any) {
      if (err && err.code === '45000') return res.status(400).json({ message: err.message });
      throw err;
    }
  } catch (err) { next(err); }
};

export const getCompras = async (_req: Request, res: Response, next: NextFunction) => { try { const result = await query('SELECT * FROM Compra'); res.json(result.rows); } catch (err) { next(err); } };

export const getCompraById = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('SELECT * FROM Compra WHERE idCompra=$1', [id]); const row = result.rows[0]; if (!row) return res.status(404).json({ message: 'Compra no encontrada' }); res.json(row);} catch (err) { next(err); } };

export const deleteCompra = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('DELETE FROM Compra WHERE idCompra=$1 RETURNING *', [id]); const deleted = result.rows[0]; if (!deleted) return res.status(404).json({ message: 'Compra no encontrada' }); res.json(deleted);} catch (err) { next(err); } };
