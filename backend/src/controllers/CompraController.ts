import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isValidDate, isPositiveNumber } from '../utils/validators';

export const createCompra = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fecha, total, idCliente, montoEfectivo, montoTarjeta } = req.body;
    if (!isValidDate(fecha) || !isPositiveNumber(total) || idCliente === undefined || (montoEfectivo <= 0 && montoTarjeta <= 0)) return res.status(400).json({ message: 'fecha, total, idCliente son obligatorios y montoEfectivo y montoTarjeta alguno debe ser mayor a 0' });

    // Check foreign keys exist
    const c = await query('SELECT 1 FROM Cliente WHERE idCliente=$1 LIMIT 1', [idCliente]);
    if ((c?.rowCount ?? 0) === 0) return res.status(400).json({ message: 'Cliente no existe' });

    const resultPago = await query('INSERT INTO Pago (montoEfectivo, montoTarjeta) VALUES ($1,$2) RETURNING *', [montoEfectivo, montoTarjeta]);

    const resultCompra = await query('INSERT INTO Compra (fecha,total,idCliente,idPago) VALUES ($1,$2,$3,$4) RETURNING *', [fecha, total, idCliente, idPago]);
    res.status(201).json(resultCompra.rows[0]);
  } catch (err) { next(err); }
};

export const getCompras = async (_req: Request, res: Response, next: NextFunction) => { try { const result = await query('SELECT * FROM Compra'); res.json(result.rows); } catch (err) { next(err); } };

export const getCompraById = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('SELECT * FROM Compra WHERE idCompra=$1', [id]); const row = result.rows[0]; if (!row) return res.status(404).json({ message: 'Compra no encontrada' }); res.json(row);} catch (err) { next(err); } };

export const deleteCompra = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('DELETE FROM Compra WHERE idCompra=$1 RETURNING *', [id]); const deleted = result.rows[0]; if (!deleted) return res.status(404).json({ message: 'Compra no encontrada' }); res.json(deleted);} catch (err) { next(err); } };
