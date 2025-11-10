import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
// Asegúrate de que la ruta a tus tipos sea correcta
import type { UsuarioType } from '@/types/db'

// Función auxiliar para validar entrada (adaptada para ser más flexible)
function validateUserInput(data: Partial<UsuarioType>, isCreate = true) {
    const errors: string[] = []

    if (isCreate && !data.nombre?.trim()) errors.push('El nombre es obligatorio')
    if (isCreate && !data.email?.trim()) errors.push('El correo es obligatorio')
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.push('Correo no válido')
    }

    if (isCreate && !data.password) {
        errors.push('La contraseña es obligatoria')
    }
    
    if (data.password && data.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres')
    }

    return errors
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { nombre, email, password, id_tipo = 2 } = body

        // Validaciones para creación (isCreate = true)
        const errors = validateUserInput({ nombre, email, password }, true)
        if (errors.length > 0) {
            return NextResponse.json({ success: false, errors }, { status: 400 })
        }

        // Duplicado
        const existing = await prisma.usuario.findUnique({ where: { email } })
        if (existing) {
            return NextResponse.json({ success: false, error: 'El correo ya está registrado' }, { status: 409 })
        }

        // Hash and create
        const hashed = await bcrypt.hash(password as string, 10)
        
        const user = await prisma.usuario.create({
            data: {
                nombre,
                email,
                password: hashed,
                id_tipo,
                activo: true
            }
        })

        // remove sensitive fields
        // @ts-ignore
        const { password: _, ...safeUser } = user

        return NextResponse.json({ success: true, user: safeUser }, { status: 201 })
    } catch (err) {
        console.error('POST Error:', err)
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const id = url.searchParams.get('id')

        if (id) {
            const user = await prisma.usuario.findUnique({ where: { id_usuario: Number(id) } })
            if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
            
            // @ts-ignore
            const { password: _, ...safeUser } = user
            return NextResponse.json({ user: safeUser })
        }

        const users = await prisma.usuario.findMany({
            orderBy: { id_usuario: 'asc' }
        })
        
        const safeUsers = users.map((u) => {
            // @ts-ignore
            const { password: _, ...rest } = u
            return rest
        })
        
        return NextResponse.json({ users: safeUsers })
    } catch (err) {
        console.error('GET Error:', err)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

// --- NUEVO MÉTODO PATCH PARA ACTUALIZAR ---
export async function PATCH(req: Request) {
    try {
        const url = new URL(req.url)
        const idStr = url.searchParams.get('id')

        if (!idStr) {
            return NextResponse.json({ success: false, error: 'ID de usuario obligatorio' }, { status: 400 })
        }
        const id_usuario = Number(idStr)

        const body = await req.json()
        const { nombre, email, password, id_tipo, activo } = body

        // 1. Validaciones parciales (isCreate = false)
        const errors = validateUserInput({ nombre, email, password }, false)
        if (errors.length > 0) {
            return NextResponse.json({ success: false, errors }, { status: 400 })
        }

        // 2. Verificar si el usuario existe
        const existingUser = await prisma.usuario.findUnique({ where: { id_usuario } })
        if (!existingUser) {
            return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
        }

        // 3. Si se actualiza el email, verificar que no pertenezca a otro usuario
        if (email && email !== existingUser.email) {
            const emailTaken = await prisma.usuario.findUnique({ where: { email } })
            if (emailTaken) {
                return NextResponse.json({ success: false, error: 'Este correo ya está en uso por otro usuario' }, { status: 409 })
            }
        }

        // 4. Preparar datos para actualizar
        const dataToUpdate: any = {}
        if (nombre !== undefined) dataToUpdate.nombre = nombre
        if (email !== undefined) dataToUpdate.email = email
        if (id_tipo !== undefined) dataToUpdate.id_tipo = id_tipo
        if (activo !== undefined) dataToUpdate.activo = activo
        
        // Solo hashear si viene una nueva contraseña
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10)
        }

        // 5. Ejecutar actualización
        const updatedUser = await prisma.usuario.update({
            where: { id_usuario },
            data: dataToUpdate
        })

        // @ts-ignore
        const { password: _, ...safeUser } = updatedUser

        return NextResponse.json({ success: true, user: safeUser })

    } catch (err) {
        console.error('PATCH Error:', err)
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url)
        const idStr = url.searchParams.get('id')

        if (!idStr) {
            return NextResponse.json({ success: false, error: 'ID de usuario obligatorio' }, { status: 400 })
        }
        const id_usuario = Number(idStr)

        // Verificar si existe antes de intentar borrar
        const existingUser = await prisma.usuario.findUnique({ where: { id_usuario } })
        if (!existingUser) {
             return NextResponse.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 })
        }

        // Ejecutar eliminación
        await prisma.usuario.delete({
            where: { id_usuario }
        })

        return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente' })

    } catch (err) {
        console.error('DELETE Error:', err)
        // Manejo básico de errores de integridad referencial (si el usuario tiene ventas asociadas, etc.)
        // @ts-ignore
        if (err.code === 'P2003') {
             return NextResponse.json({ success: false, error: 'No se puede eliminar el usuario porque tiene registros asociados.' }, { status: 409 })
        }
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
    }
}