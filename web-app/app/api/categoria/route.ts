import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type { TipoCategoriaType } from '@/types/db'

function validateCategoriaInput(nombre_categoria: string | undefined): string[] {
    const errors: string[] = []

    if (!nombre_categoria?.trim()) {
        errors.push('El nombre de la categoría es obligatorio')
    } else {
        if (nombre_categoria.trim().length > 100) {
            errors.push('El nombre de la categoría no puede exceder los 100 caracteres')
        }
        if (!/^[a-zA-ZÀ-ÿ0-9\s&-]+$/.test(nombre_categoria.trim())) {
            errors.push('El nombre de la categoría solo puede contener letras, números, espacios, & y guiones')
        }
    }

    return errors
}

// GET /api/categoria - Obtener todas las categorías
export async function GET(req: Request) {
    try {
        const url = new URL(req.url)
        const search = url.searchParams.get('search')?.trim()

        let whereClause = {}
        if (search) {
            whereClause = {
                nombre_categoria: {
                    contains: search,
                    mode: 'insensitive' as Prisma.QueryMode
                }
            }
        }

        const categorias = await prisma.tipoCategoria.findMany({
            where: whereClause,
            select: {
                id_categoria: true,
                nombre_categoria: true
            },
            orderBy: {
                nombre_categoria: 'asc'
            }
        })

        if (categorias.length === 0) {
            return NextResponse.json({ 
                message: 'No se encontraron categorías',
                categorias: []
            }, { status: 404 })
        }

        return NextResponse.json({ 
            categorias,
            message: 'Categorías encontradas exitosamente',
            total: categorias.length
        }, { status: 200 })

    } catch (error) {
        console.error('Error al obtener categorías:', error)
        return NextResponse.json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al obtener las categorías'
        }, { status: 500 })
    }
}

// POST /api/categoria - Crear nueva categoría
export async function POST(req: Request) {
    try {
        const body = await req.json() as Pick<TipoCategoriaType, 'nombre_categoria'>
        
        // Validaciones
        const errors = validateCategoriaInput(body.nombre_categoria)
        if (errors.length > 0) {
            return NextResponse.json({ 
                error: 'Error de validación',
                errors
            }, { status: 400 })
        }

        // Verificar si ya existe una categoría con el mismo nombre
        const existingCategoria = await prisma.tipoCategoria.findFirst({
            where: {
                nombre_categoria: {
                    equals: body.nombre_categoria.trim(),
                    mode: 'insensitive'
                }
            }
        })

        if (existingCategoria) {
            return NextResponse.json({ 
                error: 'Categoría duplicada',
                message: 'Ya existe una categoría con ese nombre'
            }, { status: 409 })
        }

        // Crear categoría
        const categoria = await prisma.tipoCategoria.create({
            data: {
                nombre_categoria: body.nombre_categoria.trim()
            },
            include: {
                _count: {
                    select: { productos: true }
                }
            }
        })

        return NextResponse.json({ 
            categoria,
            message: 'Categoría creada exitosamente'
        }, { status: 201 })

    } catch (error) {
        console.error('Error al crear categoría:', error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return NextResponse.json({ 
                    error: 'Categoría duplicada',
                    message: 'Ya existe una categoría con ese nombre'
                }, { status: 409 })
            }
            return NextResponse.json({ 
                error: 'Error en la base de datos',
                message: 'Error al crear la categoría en la base de datos'
            }, { status: 500 })
        }
        return NextResponse.json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al crear la categoría'
        }, { status: 500 })
    }
}