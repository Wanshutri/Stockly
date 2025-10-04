import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isNonEmptyString } from '../utils/validators';

// Crear marca
export const createMarca = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { nombre_marca } = req.body;
    if (!isNonEmptyString(nombre_marca)) {
      return res.status(400).json({ message: 'nombre_marca es obligatorio' });
    }
    nombre_marca = nombre_marca.trim();

    const result = await query(
      'INSERT INTO marca (nombre_marca) VALUES ($1) RETURNING id_marca',
      [nombre_marca]
    );

    res.status(201).json({ id_marca: result.rows[0].id_marca, nombre_marca });
  } catch (err) {
    next(err);
  }
};

// Obtener todas las marcas
export const getMarcas = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query('SELECT * FROM marca ORDER BY id_marca');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Obtener marca por id
export const getMarcaById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const result = await query('SELECT * FROM marca WHERE id_marca=$1', [id]);
    const row = result.rows[0];
    if (!row) return res.status(404).json({ message: 'Marca no encontrada' });

    res.json(row);
  } catch (err) {
    next(err);
  }
};

// Actualizar marca
export const updateMarca = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    let { nombre_marca } = req.body;
    if (!isNonEmptyString(nombre_marca)) {
      return res.status(400).json({ message: 'nombre_marca es obligatorio' });
    }
    nombre_marca = nombre_marca.trim();

    // Validar existencia
    const exists = await query('SELECT 1 FROM marca WHERE id_marca=$1', [id]);
    if (exists.rowCount === 0) {
      return res.status(404).json({ message: 'Marca no encontrada' });
    }

    // Actualizar
    const result = await query(
      'UPDATE marca SET nombre_marca=$1 WHERE id_marca=$2 RETURNING *',
      [nombre_marca, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

// Eliminar marca
export const deleteMarca = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    try {
      const result = await query(
        'SELECT * FROM eliminar_marca($1)',
        [id]
      );

      const deleted = result.rows[0];
      res.json({ id_marca: deleted.id_marca, nombre_marca: deleted.nombre_marca });

    } catch (err: any) {
      // Captura las excepciones de PostgreSQL
      if (err.code === 'NO_DATA_FOUND') {
        return res.status(404).json({ message: 'Marca no encontrada' });
      }
      if (err.code === 'foreign_key_violation') {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
};
