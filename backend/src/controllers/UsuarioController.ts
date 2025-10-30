// Importaciones de módulos y tipos
import { Request, Response, NextFunction } from 'express';
// Importa la función de consulta a la DB
import { query } from '../db/postgres';
// Importa la utilidad de validación de strings
import { is_non_empty_string } from '../utils/validators';
// Librería para hasheo de contraseñas
import bcrypt from 'bcrypt';
// Librería para generación de tokens (JWT)
import jwt from 'jsonwebtoken';
// Configuraciones de la aplicación
import config from '../config/config';

// Constante para definir la complejidad del hasheo de contraseñas
const SALT_ROUNDS = 10;

// -------------------------------------------------------------------

/**
 * @function create_usuario
 * @description Crea un nuevo usuario en la base de datos.
 * @param {Request} req El objeto de la solicitud de Express. Contiene los datos del usuario en `req.body`.
 * @param {Response} res El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 201 y los datos del nuevo usuario, o 400/409 si hay errores de validación/conflicto.
 */
export const create_usuario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { nombre, email, password, id_tipo } = req.body;

        // Validación de que todos los campos obligatorios estén presentes y no vacíos
        if (
            !is_non_empty_string(nombre) ||
            !is_non_empty_string(email) ||
            !is_non_empty_string(password) ||
            id_tipo === undefined
        )
            return res
                .status(400) // Bad Request
                .json({ message: 'nombre, email, password e id_tipo son obligatorios' });

        // Limpieza y normalización de datos
        nombre = nombre.trim();
        email = email.trim().toLowerCase(); // Normalizar email a minúsculas

        // Validación de longitud mínima de contraseña
        if (password.length < 6)
            return res.status(400).json({ message: 'password debe tener al menos 6 caracteres' });

        // Verificar si el email ya está registrado para evitar duplicados
        const existe = await query('SELECT 1 FROM usuario WHERE email=$1 LIMIT 1', [email]);
        if ((existe?.rowCount ?? 0) > 0)
            return res.status(409).json({ message: 'email ya registrado' }); // Conflict

        // Hashear la contraseña de forma segura antes de la inserción
        const hash = await bcrypt.hash(password, SALT_ROUNDS);

        // Inserción del nuevo usuario en la base de datos
        const resultado = await query(
            // Se retorna el objeto del usuario recién creado
            'INSERT INTO usuario (nombre, email, password, id_tipo) VALUES ($1,$2,$3,$4) RETURNING id_usuario, nombre, email, activo, id_tipo',
            [nombre, email, hash, id_tipo]
        );

        res.status(201).json(resultado.rows[0]); // Respuesta exitosa: Creado
    } catch (err : any) {        
        
        // 💡 Manejo de error de PostgreSQL: Violación de Integridad de Datos (Foreign Key)
        if (err && err.code === '23503') {
            // Código 23503: foreign_key_violation (Ej: id_tipo no existe)
            return res.status(409).json({
                message: "No se puede crear el usuario porque el Tipo de Usuario no existe."
            });
        }

        // 💡 Manejo de error de PostgreSQL: Violación de Unicidad
        if (err && err.code === '23505') {
            // Código 23505: unique_violation (Ej: email ya registrado)
            return res.status(409).json({ message: 'email ya registrado' });
        }

        // Pasar cualquier otro error al middleware de manejo de errores de Express
        console.error('Error en create_usuario:', err);
        next(err);
    }
};

// -------------------------------------------------------------------

/**
 * @function get_usuarios
 * @description Recupera la lista completa de todos los usuarios de la base de datos.
 * @param {Request} _req El objeto de la solicitud (no usado en este caso).
 * @param {Response} res El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y un array de objetos de usuario.
 */
export const get_usuarios = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        // Consulta para obtener todos los usuarios, excluyendo el campo 'password'
        const resultado = await query(
            'SELECT id_usuario, nombre, email, activo, id_tipo FROM usuario ORDER BY id_usuario ASC'
        );
        res.json(resultado.rows);
    } catch (err) {
        console.error('Error en get_usuarios:', err);
        next(err);
    }
};

// -------------------------------------------------------------------

/**
 * @function get_usuario_by_id
 * @description Recupera un usuario específico por su ID.
 * @param {Request} req El objeto de la solicitud. Contiene el ID del usuario en `req.params.id`.
 * @param {Response} res El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y el objeto de usuario, o 400/404 si hay errores.
 */
export const get_usuario_by_id = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Convertir y validar el ID del parámetro de ruta
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

        // Consulta por ID
        const resultado = await query(
            'SELECT id_usuario, nombre, email, activo, id_tipo FROM usuario WHERE id_usuario=$1',
            [id]
        );

        const fila = resultado.rows[0];
        // Manejo de caso: usuario no encontrado
        if (!fila) return res.status(404).json({ message: 'usuario no encontrado' });

        res.json(fila);
    } catch (err) {
        console.error('Error en get_usuario_by_id:', err);
        next(err);
    }
};

// -------------------------------------------------------------------

/**
 * @function update_usuario
 * @description Actualiza los campos de un usuario existente por su ID de forma parcial (PATCH).
 * @param {Request} req El objeto de la solicitud. Contiene el ID en `req.params.id` y los campos a actualizar en `req.body`.
 * @param {Response} res El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y el objeto de usuario actualizado, o 400/404/409 si hay errores.
 */
export const update_usuario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

        const { nombre, email, password, activo, id_tipo } = req.body;
        const set_clauses: string[] = []; // Array para construir dinámicamente el SET de la consulta
        const valores: any[] = [];
        let parametro_index = 1; // Índice para los placeholders ($1, $2, ...)

        // Lógica para construir dinámicamente la consulta UPDATE

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
            valores.push(email.trim().toLowerCase()); // Normalización de email
        }

        if (password !== undefined) {
            if (!is_non_empty_string(password) || password.length < 6)
                return res.status(400).json({ message: 'password inválido' });
            // Hashear la nueva contraseña
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

        // Si no hay campos válidos para actualizar, retorna un error
        if (set_clauses.length === 0)
            return res.status(400).json({ message: 'no hay campos para actualizar' });

        // Construcción final de la consulta SQL
        const sql = `UPDATE usuario SET ${set_clauses.join(
            ', '
        )} WHERE id_usuario=$${parametro_index} RETURNING id_usuario, nombre, email, activo, id_tipo`;

        // Añadir el ID del usuario al final de los valores para el WHERE
        valores.push(id);

        const resultado = await query(sql, valores);
        const actualizado = resultado.rows[0];
        if (!actualizado) return res.status(404).json({ message: 'usuario no encontrado' });

        res.json(actualizado);
    } catch (err: any) {
        
        // 💡 Manejo de error de PostgreSQL: Violación de Integridad de Datos (Foreign Key)
        if (err && err.code === '23503') {
            // Código 23503: foreign_key_violation (Ej: id_tipo no existe)
            return res.status(409).json({
                message: "No se puede actualizar el usuario porque el Tipo de Usuario no existe."
            });
        }
        
        // Manejo específico para violación de unicidad del email (Error 23505 en PostgreSQL)
        if (err && err.code === '23505') {
            return res.status(409).json({ message: 'email ya registrado' });
        }
        console.error('Error en update_usuario:', err);
        next(err);
    }
};

// -------------------------------------------------------------------

/**
 * @function delete_usuario
 * @description Elimina permanentemente un usuario de la base de datos por su ID, siguiendo el estándar REST.
 * @param {Request} req El objeto de la solicitud. Contiene el ID en `req.params.id`.
 * @param {Response} res El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 204 (No Content) si la eliminación es exitosa (sin cuerpo), o 400/404 si hay errores.
 */
export const delete_usuario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) return res.status(400).json({ message: 'id inválido' });

        // Ejecución de la eliminación
        // Mantenemos RETURNING para confirmar que una fila fue afectada.
        const resultado = await query(
            'DELETE FROM usuario WHERE id_usuario=$1 RETURNING id_usuario',
            [id]
        );

        const eliminado = resultado.rows[0];
        // Si la base de datos no reporta filas eliminadas
        if (!eliminado) return res.status(404).json({ message: 'usuario no encontrado' });

        // Eliminación exitosa: Responde con 204 No Content, sin cuerpo.
        return res.status(204).end();
    } catch (err) {
        console.error('Error en delete_usuario:', err);
        next(err);
    }
};

// -------------------------------------------------------------------

/**
 * @function login_usuario
 * @description Autentica un usuario verificando credenciales y genera un JWT.
 * @param {Request} req El objeto de la solicitud. Contiene `email` y `password` en `req.body`.
 * @param {Response} res El objeto de la respuesta de Express.
 * @param {NextFunction} next La función para pasar el control al siguiente middleware de errores.
 * @returns {Response} Responde con un estado 200 y el JSON Web Token (JWT), o 400/401 si falla la autenticación.
 */
export const login_usuario = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Validación de la presencia de credenciales
        if (typeof email !== 'string' || typeof password !== 'string')
            return res.status(400).json({ message: 'email y password son obligatorios' });

        // Buscar el usuario por email. Se requiere la columna 'password' para la verificación
        const resultado = await query(
            'SELECT id_usuario, password, nombre, email, id_tipo, activo FROM usuario WHERE email=$1 LIMIT 1',
            [email.toLowerCase()]
        );

        const usuario = resultado.rows[0];
        // Error si el usuario no existe (Unauthorized)
        if (!usuario) return res.status(401).json({ message: 'credenciales inválidas' });

        // Comparar la contraseña ingresada con el hash almacenado
        const match = await bcrypt.compare(password, usuario.password);
        // Error si la contraseña no coincide (Unauthorized)
        if (!match) return res.status(401).json({ message: 'credenciales inválidas' });

        if (usuario.activo === false) {
            return res.status(403).json({ message: 'Usuario inactivo. Contacte al administrador.' });
        }

        // Generar el token JWT con los datos clave del usuario
        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                email: usuario.email,
                nombre: usuario.nombre,
                id_tipo: usuario.id_tipo,
            },
            config.jwt_secret,
            { expiresIn: '8h' } // Token expira en 8 horas
        );

        res.json({ token }); // Envía el token al cliente
    } catch (err) {
        console.error('Error en login_usuario:', err);
        next(err);
    }
};