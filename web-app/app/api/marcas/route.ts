import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type { MarcaType } from '@/types/db'
import { z } from 'zod'

/**
 * Esquema de validación para creación de marcas
 */
const marcaSchema = z.object({
    nombre_marca: z
        .string()
        .min(1, 'El nombre de la marca es obligatorio')
        .max(100, 'El nombre de la marca no puede exceder los 100 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ0-9\s&-]+$/, 'El nombre solo puede contener letras, números, espacios, & y guiones')
})

/**
 * GET /api/marca
 * Obtiene todas las marcas registradas. Soporta filtro por nombre (?search=)
 */
export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const search = url.searchParams.get('search')?.trim()

        const whereClause = search
            ? {
                nombre_marca: {
                    contains: search,
                    mode: 'insensitive' as Prisma.QueryMode
                }
            }
            : {}

        const marcasDB = await prisma.marca.findMany({
            where: whereClause,
            select: {
                id_marca: true,
                nombre_marca: true
            },
            orderBy: { nombre_marca: 'asc' }
        })

        if (!marcasDB || marcasDB.length === 0) {
            return NextResponse.json(
                { message: 'No se encontraron marcas.' },
                { status: 404 }
            )
        }

        const marcas: MarcaType[] = marcasDB.map((m) => ({
            id_marca: m.id_marca,
            nombre_marca: m.nombre_marca
        }))

        return NextResponse.json({ marcas }, { status: 200 })
    } catch (error) {
        console.error('Error en GET /api/marca:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/marca
 * Crea una nueva marca validando los datos de entrada.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Validación con Zod
        const validacion = marcaSchema.safeParse(body)
        if (!validacion.success) {
            return NextResponse.json(
                {
                    error: 'Datos inválidos',
                    detalles: validacion.error.flatten().fieldErrors
                },
                { status: 400 }
            )
        }

        const data = validacion.data

        // Verificar duplicado (insensitive)
        const marcaExistente = await prisma.marca.findFirst({
            where: {
                nombre_marca: {
                    equals: data.nombre_marca.trim(),
                    mode: 'insensitive'
                }
            }
        })

        if (marcaExistente) {
            return NextResponse.json(
                { error: 'La marca ya está registrada' },
                { status: 409 }
            )
        }

        // Crear nueva marca
        const marcaCreada = await prisma.marca.create({
            data: {
                nombre_marca: data.nombre_marca.trim()
            },
            include: {
                _count: { select: { productos: true } }
            }
        })

        const marca: MarcaType = {
            id_marca: marcaCreada.id_marca,
            nombre_marca: marcaCreada.nombre_marca
        }

        return NextResponse.json({ marca }, { status: 201 })
    } catch (error) {
        console.error('Error en POST /api/marca:', error)

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: 'La marca ya existe' },
                    { status: 409 }
                )
            }
        }

        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
