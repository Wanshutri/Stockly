import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type { MarcaType } from '@/types/db'

function validateMarcaInput(nombre_marca: string | undefined): string[] {
    const errors: string[] = []

    if (!nombre_marca?.trim()) {
        errors.push('El nombre de la marca es obligatorio')
    } else {
        if (nombre_marca.trim().length > 100) {
            errors.push('El nombre de la marca no puede exceder los 100 caracteres')
        }
        if (!/^[a-zA-ZÀ-ÿ0-9\s&-]+$/.test(nombre_marca.trim())) {
            errors.push('El nombre de la marca solo puede contener letras, números, espacios, & y guiones')
        }
    }

    return errors
}

// GET /api/marca - Obtener todas las marcas
export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const search = url.searchParams.get('search')?.trim()

        let whereClause = {}
        if (search) {
            whereClause = {
                nombre_marca: {
                    contains: search,
                    mode: 'insensitive' as Prisma.QueryMode
                }
            }
        }

        const marcas = await prisma.marca.findMany({
            where: whereClause,
            select: {
                id_marca: true,
                nombre_marca: true
            },
            orderBy: {
                nombre_marca: 'asc'
            }
        })

        if (marcas.length === 0) {
            return NextResponse.json({ 
                message: 'No se encontraron marcas',
                marcas: []
            }, { status: 404 })
        }

        return NextResponse.json({ 
            marcas,
            message: 'Marcas encontradas exitosamente',
            total: marcas.length
        }, { status: 200 })

    } catch (error) {
        console.error('Error al obtener marcas:', error)
        return NextResponse.json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al obtener las marcas'
        }, { status: 500 })
    }
}

// POST /api/marca - Crear nueva marca
export async function POST(req: Request) {
    try {
        const body = await req.json() as Pick<MarcaType, 'nombre_marca'>
        
        // Validaciones
        const errors = validateMarcaInput(body.nombre_marca)
        if (errors.length > 0) {
            return NextResponse.json({ 
                error: 'Error de validación',
                errors 
            }, { status: 400 })
        }

        // Verificar si ya existe una marca con el mismo nombre
        const existingMarca = await prisma.marca.findFirst({
            where: {
                nombre_marca: {
                    equals: body.nombre_marca.trim(),
                    mode: 'insensitive'
                }
            }
        })

        if (existingMarca) {
            return NextResponse.json({ 
                error: 'Marca duplicada',
                message: 'Ya existe una marca con ese nombre'
            }, { status: 409 })
        }

        // Crear marca
        const marca = await prisma.marca.create({
            data: {
                nombre_marca: body.nombre_marca.trim()
            },
            include: {
                _count: {
                    select: { productos: true }
                }
            }
        })

        return NextResponse.json({ 
            marca,
            message: 'Marca creada exitosamente'
        }, { status: 201 })

    } catch (error) {
        console.error('Error al crear marca:', error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json({ 
                    error: 'Marca duplicada',
                    message: 'Ya existe una marca con ese nombre'
                }, { status: 409 })
            }
            return NextResponse.json({ 
                error: 'Error en la base de datos',
                message: 'Error al crear la marca en la base de datos'
            }, { status: 500 })
        }
        return NextResponse.json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al crear la marca'
        }, { status: 500 })
    }
}