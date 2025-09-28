import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: any) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizePhone(value: any): string | null {
  if (value === null || value === undefined) return null;
  // accept numbers or strings; convert to string and remove spaces
  const s = String(value).replace(/\s+/g, '');
  return s;
}

function isValidPhoneDigits(s: string) {
  return /^\d{9}$/.test(s);
}

// Create
export const createCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { nombre, email, telefono } = req.body;
    // Trim and basic checks
    if (!isNonEmptyString(nombre) || !isNonEmptyString(email) || telefono === undefined) {
      return res.status(400).json({ message: 'nombre, email y telefono son obligatorios y no pueden ser vacíos' });
    }
    nombre = nombre.trim();
    email = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(email)) return res.status(400).json({ message: 'email con formato inválido' });

    const phoneStr = normalizePhone(telefono);
    if (!phoneStr || !isValidPhoneDigits(phoneStr)) return res.status(400).json({ message: 'telefono debe contener exactamente 9 dígitos numéricos' });

    // Uniqueness check
    const existing = await query('SELECT 1 FROM cliente WHERE email = $1 LIMIT 1', [email]);
  if ((existing?.rowCount ?? 0) > 0) return res.status(409).json({ message: 'email ya registrado' });

    const sql = `INSERT INTO cliente (nombre, email, telefono) VALUES ($1, $2, $3) RETURNING *`;
    const result = await query(sql, [nombre, email, phoneStr]);
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err && err.code === '23505') {
      return res.status(409).json({ message: 'email ya registrado' });
    }
    next(err);
  }
};

// Get all
export const getClientes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query('SELECT * FROM cliente ORDER BY idCliente ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Get by id
export const getClienteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const result = await query('SELECT * FROM cliente WHERE idCliente = $1', [id]);
    const cliente = result.rows[0];
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
};

// Update
export const updateCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const { nombre, email, telefono } = req.body;
    const data: any = {};
    if (nombre !== undefined) {
      if (!isNonEmptyString(nombre)) return res.status(400).json({ message: 'nombre no puede ser vacío' });
      data.nombre = nombre.trim();
    }
    if (email !== undefined) {
      if (!isNonEmptyString(email)) return res.status(400).json({ message: 'email no puede ser vacío' });
      const emailNorm = email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(emailNorm)) return res.status(400).json({ message: 'email con formato inválido' });
      data.email = emailNorm;
    }
    if (telefono !== undefined) {
      const phoneStr = normalizePhone(telefono);
      if (!phoneStr || !isValidPhoneDigits(phoneStr)) return res.status(400).json({ message: 'telefono debe contener exactamente 9 dígitos numéricos' });
      data.telefono = phoneStr;
    }

    const set: string[] = [];
    const params: any[] = [];
    let idx = 1;
    if (data.nombre !== undefined) { set.push(`nombre = $${idx++}`); params.push(data.nombre); }
  if (data.email !== undefined) { set.push(`email = $${idx++}`); params.push(data.email); }
    if (data.telefono !== undefined) { set.push(`telefono = $${idx++}`); params.push(data.telefono); }

    if (set.length === 0) return res.status(400).json({ message: 'No hay campos para actualizar' });

    // If email is being changed, ensure uniqueness (exclude current record)
    if (data.email !== undefined) {
      const exists = await query('SELECT 1 FROM cliente WHERE email = $1 AND idCliente != $2 LIMIT 1', [data.email, id]);
  if ((exists?.rowCount ?? 0) > 0) return res.status(409).json({ message: 'email ya registrado' });
    }

    const sql = `UPDATE cliente SET ${set.join(', ')} WHERE idCliente = $${idx} RETURNING *`;
    params.push(id);
    const result = await query(sql, params);
    const updated = result.rows[0];
    if (!updated) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(updated);
  } catch (err: any) {
    if (err && err.code === '23505') return res.status(409).json({ message: 'email ya registrado' });
    next(err);
  }
};

// Delete
export const deleteCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const result = await query('DELETE FROM cliente WHERE idCliente = $1 RETURNING *', [id]);
    const deleted = result.rows[0];
    if (!deleted) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(deleted);
  } catch (err: any) {
    next(err);
  }
};
