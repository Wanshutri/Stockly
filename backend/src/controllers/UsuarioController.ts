import { Request, Response, NextFunction } from 'express';
import { query } from '../db/postgres';
import { is_non_empty_string, is_positive_number } from '../utils/validators';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config';

const SALT_ROUNDS = 10;

export const create_usuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { nombre, email, password, id_tipo } = req.body;

    if (
      !is_non_empty_string(nombre) ||
      !is_non_empty_string(email) ||
      !is_non_empty_string(password) ||
      id_tipo === undefined
    )
      return res
        .status(400)
        .json({ message: 'nombre, email, password e id_tipo son obligatorios' });

    nombre = nombre.trim();
    email = email.trim().toLowerCase();

    if (password.length < 6)
      return res.status(400).json({ message: 'password debe tener al menos 6 caracteres' });

    const existe = await query('SELECT 1 FROM usuario WHERE email=$1 LIMIT 1', [email]);
    if ((existe?.rowCount ?? 0) > 0)
      return res.status(409).json({ message: 'email ya registrado' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const resultado = await query(
      'INSERT INTO usuario (nombre, email, password, id_tipo) VALUES ($1,$2,$3,$4) RETURNING id_usuario, nombre, email, activo, id_tipo',
      [nombre, email, hash, id_tipo]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const get_usuarios = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const resultado = await query(
      'SELECT id_usuario, nombre, email, activo, id_tipo FROM usuario'
    );
    res.json(resultado.rows);
  } catch (err) {
    next(err);
  }
};

export const get_usuario_by_id = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const resultado = await query(
      'SELECT id_usuario, nombre, email, activo, id_tipo FROM usuario WHERE id_usuario=$1',
      [id]
    );

    const fila = resultado.rows[0];
    if (!fila) return res.status(404).json({ message: 'usuario no encontrado' });

    res.json(fila);
  } catch (err) {
    next(err);
  }
};

export const update_usuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    // Nota: SALT_ROUNDS y is_non_empty_string deben estar definidos en el ámbito del archivo
    // o ser importados, como en tu código original.

    const { nombre, email, password, activo, id_tipo } = req.body;
    const set_clauses: string[] = [];
    const valores: any[] = [];
    let parametro_index = 1;

    if (nombre !== undefined) {
      if (!is_non_empty_string(nombre))
        return res.status(400).json({ message: 'nombre no puede ser vacío' });
      set_clauses.push(`nombre=$${parametro_index++}`);
      valores.push(nombre.trim());
    }

    if (email !== undefined) {
      if (!is_non_empty_string(email))
        return res.status(400).json({ message: 'email no puede ser vacío' });
      set_clauses.push(`email=$${parametro_index++}`);
      valores.push(email.trim().toLowerCase());
    }

    if (password !== undefined) {
      if (!is_non_empty_string(password) || password.length < 6)
        return res.status(400).json({ message: 'password inválido' });
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      set_clauses.push(`password=$${parametro_index++}`);
      valores.push(hash);
    }

    if (activo !== undefined) {
      set_clauses.push(`activo=$${parametro_index++}`);
      valores.push(Boolean(activo));
    }

    if (id_tipo !== undefined) {
      set_clauses.push(`id_tipo=$${parametro_index++}`);
      valores.push(id_tipo);
    }

    if (set_clauses.length === 0)
      return res.status(400).json({ message: 'no hay campos para actualizar' });

    const sql = `UPDATE usuario SET ${set_clauses.join(
      ', '
    )} WHERE id_usuario=$${parametro_index} RETURNING id_usuario, nombre, email, activo, id_tipo`;

    valores.push(id);

    const resultado = await query(sql, valores);
    const actualizado = resultado.rows[0];
    if (!actualizado) return res.status(404).json({ message: 'usuario no encontrado' });

    res.json(actualizado);
  } catch (err: any) { // Tipamos el error para acceder al código
    // Manejo específico para violación de unicidad del email (PostgreSQL error code 23505)
    if (err && err.code === '23505') {
      return res.status(409).json({ message: 'email ya registrado' });
    }
    next(err);
  }
};

export const delete_usuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

    const resultado = await query(
      'DELETE FROM usuario WHERE id_usuario=$1 RETURNING id_usuario, nombre, email',
      [id]
    );

    const eliminado = resultado.rows[0];
    if (!eliminado) return res.status(404).json({ message: 'usuario no encontrado' });

    res.json(eliminado);
  } catch (err) {
    next(err);
  }
};

export const login_usuario = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string')
      return res.status(400).json({ message: 'email y password son obligatorios' });

    const resultado = await query(
      'SELECT id_usuario, password, nombre, email, id_tipo FROM usuario WHERE email=$1 LIMIT 1',
      [email.toLowerCase()]
    );

    const usuario = resultado.rows[0];
    if (!usuario) return res.status(401).json({ message: 'credenciales inválidas' });

    const match = await bcrypt.compare(password, usuario.password);
    if (!match) return res.status(401).json({ message: 'credenciales inválidas' });

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre,
        id_tipo: usuario.id_tipo,
      },
      config.jwt_secret,
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
};