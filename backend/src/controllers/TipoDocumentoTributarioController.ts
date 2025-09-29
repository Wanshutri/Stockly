import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isNonEmptyString } from '../utils/validators';

export const createTipoDocumento = async (req: Request, res: Response, next: NextFunction) => { try { let { nombreTipo } = req.body; if (!isNonEmptyString(nombreTipo)) return res.status(400).json({ message: 'nombreTipo es obligatorio' }); nombreTipo = nombreTipo.trim(); const result = await query('INSERT INTO TipoDocumentoTributario (nombreTipo) VALUES ($1) RETURNING *', [nombreTipo]); res.status(201).json(result.rows[0]); } catch (err) { next(err); } };

export const getTipoDocumentos = async (_req: Request, res: Response, next: NextFunction) => { try { const result = await query('SELECT * FROM TipoDocumentoTributario'); res.json(result.rows); } catch (err) { next(err); } };

export const getTipoDocumentoById = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('SELECT * FROM TipoDocumentoTributario WHERE idTipo=$1', [id]); const row = result.rows[0]; if (!row) return res.status(404).json({ message: 'TipoDocumento no encontrado' }); res.json(row);} catch (err) { next(err); } };

export const updateTipoDocumento = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); let { nombreTipo } = req.body; if (!isNonEmptyString(nombreTipo)) return res.status(400).json({ message: 'nombreTipo es obligatorio' }); nombreTipo = nombreTipo.trim(); const result = await query('UPDATE TipoDocumentoTributario SET nombreTipo=$1 WHERE idTipo=$2 RETURNING *', [nombreTipo, id]); const updated = result.rows[0]; if (!updated) return res.status(404).json({ message: 'TipoDocumento no encontrado' }); res.json(updated);} catch (err) { next(err); } };

export const deleteTipoDocumento = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('DELETE FROM TipoDocumentoTributario WHERE idTipo=$1 RETURNING *', [id]); const deleted = result.rows[0]; if (!deleted) return res.status(404).json({ message: 'TipoDocumento no encontrado' }); res.json(deleted);} catch (err) { next(err); } };
