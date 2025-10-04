import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';

// Create cliente via stored procedure
export const createCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre, email, telefono } = req.body;
    const result = await query('SELECT * FROM create_cliente($1,$2,$3)', [nombre, email, telefono]);
    const row = result.rows[0];
    return res.status(201).json(row);
  } catch (err: any) {
    // 23505 is unique_violation we used for email conflict
    if (err && err.code === '23505') return res.status(409).json({ message: 'email ya registrado' });
    // custom raise with ERRCODE '45000' uses text message
    if (err && err.code === '45000') return res.status(400).json({ message: err.message });
    next(err);
  }
};

// Get all
export const getClientes = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query('SELECT * FROM cliente');
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
    const result = await query('SELECT * FROM update_cliente($1,$2,$3,$4)', [id, nombre, email, telefono]);
    const updated = result.rows[0];
    if (!updated) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(updated);
  } catch (err: any) {
    if (err && err.code === '23505') return res.status(409).json({ message: 'email ya registrado' });
    if (err && err.code === '45000') return res.status(400).json({ message: err.message });
    next(err);
  }
};

// Delete
export const deleteCliente = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });
    const result = await query('SELECT * FROM delete_cliente($1)', [id]);
    const deleted = result.rows[0];
    if (!deleted) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(deleted);
  } catch (err: any) {
    if (err && err.code === '45000') return res.status(400).json({ message: err.message });
    next(err);
  }
};

// Get by id
export const getClienteByEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = String(req.body.email).trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email inválido' });

    const result = await query('SELECT * FROM cliente WHERE email = $1', [email]);
    const cliente = result.rows[0];
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
};