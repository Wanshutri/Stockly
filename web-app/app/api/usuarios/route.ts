import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import type { UsuarioType } from '@/types/db'

// Función auxiliar opcional
function validateUserInput({ nombre, email, password }: Partial<UsuarioType>) {
    const errors: string[] = []

    if (!nombre?.trim()) errors.push('El nombre es obligatorio')
    if (!email?.trim()) errors.push('El correo es obligatorio')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Correo no válido')

    if (!password) errors.push('La contraseña es obligatoria')
    else if (password.length < 6) errors.push('La contraseña debe tener al menos 6 caracteres')

    return errors
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { nombre, email, password, id_tipo = 2 } = body as Partial<UsuarioType>

        // Validaciones
        const errors = validateUserInput({ nombre, email, password })
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
        const createData = {
            nombre: nombre as string,
            email: email as string,
            password: hashed,
            id_tipo,
            activo: true
        }
        const user = await prisma.usuario.create({ data: createData })

        // remove sensitive fields before returning
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _password, ...safeUser } = user as UsuarioType

        return NextResponse.json({ success: true, user: safeUser }, { status: 201 })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const id = url.searchParams.get('id')

        if (id) {
            const user = await prisma.usuario.findUnique({ where: { id_usuario: Number(id) } })
            if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 })
            // remove password
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _p, ...rest } = user as UsuarioType
            return NextResponse.json({ user: rest })
        }

        const users = await prisma.usuario.findMany()
        // strip sensitive fields
        const safe = users.map((u) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password: _p, ...rest } = u as UsuarioType
            return rest
        })
        return NextResponse.json({ users: safe })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'server_error' }, { status: 500 })
    }
}
