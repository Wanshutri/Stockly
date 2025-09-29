import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isNonEmptyString } from '../utils/validators';

export const createMarca = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { nombreMarca } = req.body;
    if (!isNonEmptyString(nombreMarca)) return res.status(400).json({ message: 'nombreMarca es obligatorio' });
    nombreMarca = nombreMarca.trim();
    const result = await query('INSERT INTO Marca (nombreMarca) VALUES ($1) RETURNING *', [nombreMarca]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

export const getMarcas = async (_req: Request, res: Response, next: NextFunction) => {
  try { const result = await query('SELECT * FROM Marca'); res.json(result.rows); } catch (err) { next(err); }
};

export const getMarcaById = async (req: Request, res: Response, next: NextFunction) => {
  try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('SELECT * FROM Marca WHERE idMarca=$1', [id]); const row = result.rows[0]; if (!row) return res.status(404).json({ message: 'Marca no encontrada' }); res.json(row);} catch (err) { next(err); }
};

export const updateMarca = async (req: Request, res: Response, next: NextFunction) => {
  try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); let { nombreMarca } = req.body; if (!isNonEmptyString(nombreMarca)) return res.status(400).json({ message: 'nombreMarca es obligatorio' }); nombreMarca = nombreMarca.trim(); const result = await query('UPDATE Marca SET nombreMarca=$1 WHERE idMarca=$2 RETURNING *', [nombreMarca, id]); const updated = result.rows[0]; if (!updated) return res.status(404).json({ message: 'Marca no encontrada' }); res.json(updated);} catch (err) { next(err); }
};

export const deleteMarca = async (req: Request, res: Response, next: NextFunction) => {
  try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('DELETE FROM Marca WHERE idMarca=$1 RETURNING *', [id]); const deleted = result.rows[0]; if (!deleted) return res.status(404).json({ message: 'Marca no encontrada' }); res.json(deleted);} catch (err) { next(err); }
};
