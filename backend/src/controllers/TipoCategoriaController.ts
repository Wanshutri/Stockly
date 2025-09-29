import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isNonEmptyString } from '../utils/validators';

export const createTipoCategoria = async (req: Request, res: Response, next: NextFunction) => {
  try { let { nombreCategoria } = req.body; if (!isNonEmptyString(nombreCategoria)) return res.status(400).json({ message: 'nombreCategoria es obligatorio' }); nombreCategoria = nombreCategoria.trim(); const result = await query('INSERT INTO TipoCategoria (nombreCategoria) VALUES ($1) RETURNING *', [nombreCategoria]); res.status(201).json(result.rows[0]); } catch (err) { next(err); }
};

export const getTipoCategorias = async (_req: Request, res: Response, next: NextFunction) => { try { const result = await query('SELECT * FROM TipoCategoria'); res.json(result.rows); } catch (err) { next(err); } };

export const getTipoCategoriaById = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('SELECT * FROM TipoCategoria WHERE idCategoria=$1', [id]); const row = result.rows[0]; if (!row) return res.status(404).json({ message: 'TipoCategoria no encontrada' }); res.json(row);} catch (err) { next(err); } };

export const updateTipoCategoria = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); let { nombreCategoria } = req.body; if (!isNonEmptyString(nombreCategoria)) return res.status(400).json({ message: 'nombreCategoria es obligatorio' }); nombreCategoria = nombreCategoria.trim(); const result = await query('UPDATE TipoCategoria SET nombreCategoria=$1 WHERE idCategoria=$2 RETURNING *', [nombreCategoria, id]); const updated = result.rows[0]; if (!updated) return res.status(404).json({ message: 'TipoCategoria no encontrada' }); res.json(updated);} catch (err) { next(err); } };

export const deleteTipoCategoria = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('DELETE FROM TipoCategoria WHERE idCategoria=$1 RETURNING *', [id]); const deleted = result.rows[0]; if (!deleted) return res.status(404).json({ message: 'TipoCategoria no encontrada' }); res.json(deleted);} catch (err) { next(err); } };
