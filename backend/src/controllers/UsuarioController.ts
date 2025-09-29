import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { isNonEmptyString } from '../utils/validators';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config';

const SALT_ROUNDS = 10;

export const createUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { nombre, email, password, idTipo } = req.body;
    if (!isNonEmptyString(nombre) || !isNonEmptyString(email) || !isNonEmptyString(password) || idTipo === undefined) return res.status(400).json({ message: 'nombre, email, password e idTipo son obligatorios' });
    nombre = nombre.trim(); email = email.trim().toLowerCase();
    if (password.length < 6) return res.status(400).json({ message: 'password debe tener al menos 6 caracteres' });

    const exists = await query('SELECT 1 FROM Usuario WHERE email=$1 LIMIT 1', [email]);
    if ((exists?.rowCount ?? 0) > 0) return res.status(409).json({ message: 'email ya registrado' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await query('INSERT INTO Usuario (nombre,email,password,idTipo) VALUES ($1,$2,$3,$4) RETURNING idUsuario,nombre,email,activo,idTipo', [nombre, email, hash, idTipo]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
};

export const getUsuarios = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await query('SELECT idUsuario,nombre,email,activo,idTipo FROM Usuario');
    res.json(result.rows);
  }
  catch (err) { next(err); }
};

export const getUsuarioById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });
    const result = await query('SELECT idUsuario,nombre,email,activo,idTipo FROM Usuario WHERE idUsuario=$1', [id]);
    const row = result.rows[0]; if (!row) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(row);
  } catch (err) { next(err); }
};

export const updateUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const { nombre, email, password, activo, idTipo } = req.body;
    const set: string[] = []; const params: any[] = [];
    let idx = 1;

    if (nombre !== undefined) {
      if (!isNonEmptyString(nombre)) return res.status(400).json({ message: 'nombre no puede ser vacío' });
      set.push(`nombre=$${idx++}`); params.push(nombre.trim());
    }
    if (email !== undefined) {
      if (!isNonEmptyString(email)) return res.status(400).json({ message: 'email no puede ser vacío' });
      set.push(`email=$${idx++}`); params.push(email.trim().toLowerCase());
    }
    if (password !== undefined) {
      if (!isNonEmptyString(password) || password.length < 6) return res.status(400).json({ message: 'password inválido' });
      const hash = await bcrypt.hash(password, SALT_ROUNDS); set.push(`password=$${idx++}`);
      params.push(hash);
    } if (activo !== undefined) {
      set.push(`activo=$${idx++}`);
      params.push(Boolean(activo));
    } if (idTipo !== undefined) {
      set.push(`idTipo=$${idx++}`);
      params.push(idTipo);
    } if (set.length === 0) return res.status(400).json({ message: 'No hay campos para actualizar' });

    const sql = `UPDATE Usuario SET ${set.join(', ')} WHERE idUsuario=$${idx} RETURNING idUsuario,nombre,email,activo,idTipo`;
    params.push(id); const result = await query(sql, params);
    const updated = result.rows[0];
    if (!updated)
      return res.status(404).json({ message: 'Usuario no encontrado' }); res.json(updated);
  } catch (err) { next(err); }
};

export const deleteUsuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });
    const result = await query('DELETE FROM Usuario WHERE idUsuario=$1 RETURNING idUsuario,nombre,email', [id]);
    const deleted = result.rows[0]; if (!deleted) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(deleted);
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'email y password son obligatorios' });
    const result = await query('SELECT idUsuario,password,nombre,email,idTipo FROM Usuario WHERE email=$1 LIMIT 1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user.idUsuario, email: user.email, nombre: user.nombre, idTipo: user.idTipo }, config.jwtSecret, { expiresIn: '8h' });
    res.json({ token });
  } catch (err) { next(err); }
};
