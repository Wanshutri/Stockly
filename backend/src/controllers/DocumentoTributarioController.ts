import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isPositiveNumber } from '../utils/validators';

export const createDocumento = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { idCompra, idTipo } = req.body;
        if (idCompra === undefined || idTipo === undefined) return res.status(400).json({ message: 'idCompra e idTipo son obligatorios' });
        const c = await query('SELECT 1 FROM Compra WHERE idCompra=$1 LIMIT 1', [idCompra]);
        if ((c?.rowCount ?? 0) === 0) return res.status(400).json({ message: 'Compra no existe' });
        const t = await query('SELECT 1 FROM TipoDocumentoTributario WHERE idTipo=$1 LIMIT 1', [idTipo]);
        if ((t?.rowCount ?? 0) === 0) return res.status(400).json({ message: 'TipoDocumento no existe' });
        const result = await query('INSERT INTO DocumentoTributario (idCompra,idTipo) VALUES ($1,$2) RETURNING *', [idCompra, idTipo]);
        res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
};

export const getDocumentos = async (_req: Request, res: Response, next: NextFunction) => { try { const result = await query('SELECT * FROM DocumentoTributario'); res.json(result.rows); } catch (err) { next(err); } };

export const getDocumentoById = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('SELECT * FROM DocumentoTributario WHERE idDocumento=$1', [id]); const row = result.rows[0]; if (!row) return res.status(404).json({ message: 'Documento no encontrado' }); res.json(row); } catch (err) { next(err); } };

export const deleteDocumento = async (req: Request, res: Response, next: NextFunction) => { try { const id = Number(req.params.id); if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' }); const result = await query('DELETE FROM DocumentoTributario WHERE idDocumento=$1 RETURNING *', [id]); const deleted = result.rows[0]; if (!deleted) return res.status(404).json({ message: 'Documento no encontrado' }); res.json(deleted); } catch (err) { next(err); } };
