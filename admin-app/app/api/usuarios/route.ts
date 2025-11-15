import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import db from '../../../lib/pg';
import { UsuarioType } from '@/types/db';

// --- FUNCIÓN DE VALIDACIÓN (Igual que antes) ---
function validateUserInput(data: Partial<UsuarioType>, isCreate = true) {
    const errors: string[] = [];

    if (isCreate && !data.nombre?.trim()) errors.push('El nombre es obligatorio');
    if (isCreate && !data.email?.trim()) errors.push('El correo es obligatorio');
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Correo no válido');
    }

    if (isCreate && !data.password) {
        errors.push('La contraseña es obligatoria');
    }
    
    if (data.password && data.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    return errors;
}

// --- GET: Obtener todos o uno por ID ---
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const idParam = url.searchParams.get('id');

        if (idParam) {
            // Buscar un usuario específico
            const id = Number(idParam);
            const query = 'SELECT * FROM usuario WHERE id_usuario = $1';
            const result = await db.query(query, [id]);

            if (result.rows.length === 0) {
                return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
            }

            const user = result.rows[0] as UsuarioType;
            const { password: _, ...safeUser } = user; // Quitar password

            return NextResponse.json({ user: safeUser });
        } else {
            // Listar todos los usuarios
            const query = 'SELECT * FROM usuario ORDER BY id_usuario ASC';
            const result = await db.query(query);

            const safeUsers = result.rows.map((u: UsuarioType) => {
                const { password: _, ...rest } = u;
                return rest;
            });

            return NextResponse.json({ users: safeUsers });
        }
    } catch (err) {
        console.error('GET Error:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// --- POST: Crear Usuario ---
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nombre, email, password, id_tipo = 2 } = body;

        // 1. Validaciones
        const errors = validateUserInput({ nombre, email, password }, true);
        if (errors.length > 0) {
            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        // 2. Verificar Duplicado
        const checkQuery = 'SELECT id_usuario FROM usuario WHERE email = $1';
        const checkResult = await db.query(checkQuery, [email]);

        if (checkResult.rows.length > 0) {
            return NextResponse.json({ success: false, error: 'El correo ya está registrado' }, { status: 409 });
        }

        // 3. Hash Password
        const hashed = await bcrypt.hash(password, 10);

        // 4. Insertar (RETURNING * nos devuelve el objeto creado inmediatamente)
        const insertQuery = `
            INSERT INTO usuario (nombre, email, password, id_tipo, activo)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [nombre, email, hashed, id_tipo, true];
        const insertResult = await db.query(insertQuery, values);
        
        const newUser = insertResult.rows[0] as UsuarioType;
        const { password: _, ...safeUser } = newUser;

        return NextResponse.json({ success: true, user: safeUser }, { status: 201 });

    } catch (err) {
        console.error('POST Error:', err);
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}

// --- PATCH: Actualizar Usuario ---
export async function PATCH(req: Request) {
    try {
        const url = new URL(req.url);
        const idStr = url.searchParams.get('id');

        if (!idStr) return NextResponse.json({ success: false, error: 'Falta ID' }, { status: 400 });
        const id_usuario = Number(idStr);

        const body = await req.json();
        const { nombre, email, password, id_tipo, activo } = body;

        // 1. Validaciones parciales
        const errors = validateUserInput({ nombre, email, password }, false);
        if (errors.length > 0) {
            return NextResponse.json({ success: false, errors }, { status: 400 });
        }

        // 2. Verificar existencia del usuario a editar
        const findQuery = 'SELECT * FROM usuario WHERE id_usuario = $1';
        const findResult = await db.query(findQuery, [id_usuario]);

        if (findResult.rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
        }
        const currentUser = findResult.rows[0] as UsuarioType;

        // 3. Verificar duplicado de email (si cambió)
        if (email && email !== currentUser.email) {
            const duplicateCheck = 'SELECT id_usuario FROM usuario WHERE email = $1';
            const duplicateResult = await db.query(duplicateCheck, [email]);
            if (duplicateResult.rows.length > 0) {
                return NextResponse.json({ success: false, error: 'Email ya en uso' }, { status: 409 });
            }
        }

        // 4. Construir Query Dinámica (Lo más complejo de SQL puro)
        let updates: string[] = [];
        let values: any[] = [];
        let counter = 1; // Para los $1, $2...

        if (nombre !== undefined) { updates.push(`nombre = $${counter++}`); values.push(nombre); }
        if (email !== undefined) { updates.push(`email = $${counter++}`); values.push(email); }
        if (id_tipo !== undefined) { updates.push(`id_tipo = $${counter++}`); values.push(id_tipo); }
        if (activo !== undefined) { updates.push(`activo = $${counter++}`); values.push(activo); }
        
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            updates.push(`password = $${counter++}`);
            values.push(hashed);
        }

        if (updates.length === 0) {
            return NextResponse.json({ success: true, message: 'Nada que actualizar' });
        }

        // Agregamos el ID al final para el WHERE
        values.push(id_usuario);
        const updateQuery = `
            UPDATE usuario 
            SET ${updates.join(', ')} 
            WHERE id_usuario = $${counter} 
            RETURNING *
        `;

        const updateResult = await db.query(updateQuery, values);
        const updatedUser = updateResult.rows[0] as UsuarioType;
        const { password: _, ...safeUser } = updatedUser;

        return NextResponse.json({ success: true, user: safeUser });

    } catch (err) {
        console.error('PATCH Error:', err);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}

// --- DELETE: Eliminar Usuario ---
export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const idStr = url.searchParams.get('id');

        if (!idStr) return NextResponse.json({ success: false, error: 'Falta ID' }, { status: 400 });
        const id_usuario = Number(idStr);

        // 1. Verificar si existe
        const checkQuery = 'SELECT id_usuario FROM usuario WHERE id_usuario = $1';
        const checkResult = await db.query(checkQuery, [id_usuario]);

        if (checkResult.rows.length === 0) {
            return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
        }

        // 2. Eliminar
        const deleteQuery = 'DELETE FROM usuario WHERE id_usuario = $1';
        await db.query(deleteQuery, [id_usuario]);

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('DELETE Error:', err);
        return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
    }
}