import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isPositiveNumber } from '../utils/validators';

export const createPago = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { montoEfectivo = 0, montoTarjeta = 0 } = req.body;
    if (!isPositiveNumber(montoEfectivo) || !isPositiveNumber(montoTarjeta)) return res.status(400).json({ message: 'montos inválidos' });
    const result = await query('INSERT INTO Pago (montoEfectivo, montoTarjeta) VALUES ($1,$2) RETURNING *', [montoEfectivo, montoTarjeta]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

export const getPagos = async (_req: Request, res: Response, next: NextFunction) => { try { const result = await query('SELECT * FROM Pago'); res.json(result.rows); } catch (err) { next(err); } };

export const getPagoById = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('SELECT * FROM Pago WHERE idPago=$1', [id]); const row = result.rows[0]; if (!row) return res.status(404).json({ message: 'Pago no encontrado' }); res.json(row);} catch (err) { next(err); } };

export const deletePago = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('DELETE FROM Pago WHERE idPago=$1 RETURNING *', [id]); const deleted = result.rows[0]; if (!deleted) return res.status(404).json({ message: 'Pago no encontrado' }); res.json(deleted);} catch (err) { next(err); } };
