import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import type { MarcaType } from '@/types/db'

type Params = { params: { id: string } }

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

// GET /api/marca/[id] - Obtener una marca por ID
export async function GET(_req: Request, context: any) {
    const { params } = context
    try {
        const id = parseInt(params.id)
        if (isNaN(id) || id < 1) {
            return NextResponse.json({ 
                error: 'Error de validación',
                message: 'El ID debe ser un número entero positivo'
            }, { status: 400 })
        }

        const marca = await prisma.marca.findUnique({
            where: { id_marca: id },
            select: {
                id_marca: true,
                nombre_marca: true
            }
        })

        if (!marca) {
            return NextResponse.json({ 
                error: 'No encontrado',
                message: 'La marca especificada no existe'
            }, { status: 404 })
        }

        return NextResponse.json({ 
            marca,
            message: 'Marca encontrada exitosamente'
        }, { status: 200 })

    } catch (error) {
        console.error('Error al obtener marca:', error)
        return NextResponse.json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al obtener la marca'
        }, { status: 500 })
    }
}

// PUT /api/marca/[id] - Actualizar una marca
export async function PUT(req: Request, context: any) {
    const { params } = context
    try {
        const id = parseInt(params.id)
        if (isNaN(id) || id < 1) {
            return NextResponse.json({ 
                error: 'Error de validación',
                message: 'El ID debe ser un número entero positivo'
            }, { status: 400 })
        }

        // Verificar si la marca existe
        const existingMarca = await prisma.marca.findUnique({
            where: { id_marca: id }
        })

        if (!existingMarca) {
            return NextResponse.json({ 
                error: 'No encontrado',
                message: 'La marca especificada no existe'
            }, { status: 404 })
        }

        const body = await req.json()
        
        // Validaciones
        const errors = validateMarcaInput(body.nombre_marca)
        if (errors.length > 0) {
            return NextResponse.json({ 
                error: 'Error de validación',
                errors
            }, { status: 400 })
        }

        // Verificar si ya existe otra marca con el mismo nombre
        const duplicateMarca = await prisma.marca.findFirst({
            where: {
                nombre_marca: {
                    equals: body.nombre_marca.trim(),
                    mode: 'insensitive'
                },
                NOT: {
                    id_marca: id
                }
            }
        })

        if (duplicateMarca) {
            return NextResponse.json({ 
                error: 'Marca duplicada',
                message: 'Ya existe otra marca con ese nombre'
            }, { status: 409 })
        }

        const marca = await prisma.marca.update({
            where: { id_marca: id },
            data: { nombre_marca: body.nombre_marca.trim() },
            select: {
                id_marca: true,
                nombre_marca: true
            }
        })

        return NextResponse.json({ 
            marca,
            message: 'Marca actualizada exitosamente'
        }, { status: 200 })

    } catch (error) {
        console.error('Error al actualizar marca:', error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json({ 
                    error: 'No encontrado',
                    message: 'La marca especificada no existe'
                }, { status: 404 })
            }
            if (error.code === 'P2002') {
                return NextResponse.json({ 
                    error: 'Marca duplicada',
                    message: 'Ya existe otra marca con ese nombre'
                }, { status: 409 })
            }
            return NextResponse.json({ 
                error: 'Error en la base de datos',
                message: 'Error al actualizar la marca en la base de datos'
            }, { status: 500 })
        }
        return NextResponse.json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al actualizar la marca'
        }, { status: 500 })
    }
}

// DELETE /api/marca/[id] - Eliminar una marca
export async function DELETE(_req: Request, context: any) {
    const { params } = context
    try {
        const id = parseInt(params.id)
        if (isNaN(id) || id < 1) {
            return NextResponse.json({ 
                error: 'Error de validación',
                message: 'El ID debe ser un número entero positivo'
            }, { status: 400 })
        }

        // Verificar si la marca existe y obtener el conteo de productos
        const marca = await prisma.marca.findUnique({
            where: { id_marca: id },
            select: {
                _count: {
                    select: { productos: true }
                }
            }
        })

        if (!marca) {
            return NextResponse.json({ 
                error: 'No encontrado',
                message: 'La marca especificada no existe'
            }, { status: 404 })
        }

        // Verificar si la marca tiene productos asociados
        if (marca._count.productos > 0) {
            return NextResponse.json({ 
                error: 'Conflicto de dependencia',
                message: 'No se puede eliminar la marca porque tiene productos asociados',
                productosAsociados: marca._count.productos
            }, { status: 409 })
        }

        // Eliminar la marca
        await prisma.marca.delete({
            where: { id_marca: id }
        })

        return NextResponse.json({ 
            message: 'Marca eliminada exitosamente'
        }, { status: 200 })

    } catch (error) {
        console.error('Error al eliminar marca:', error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json({ 
                    error: 'No encontrado',
                    message: 'La marca especificada no existe'
                }, { status: 404 })
            }
            if (error.code === 'P2003') {
                return NextResponse.json({ 
                    error: 'Conflicto de dependencia',
                    message: 'No se puede eliminar la marca porque tiene productos asociados'
                }, { status: 409 })
            }
            return NextResponse.json({ 
                error: 'Error en la base de datos',
                message: 'Error al eliminar la marca en la base de datos'
            }, { status: 500 })
        }
        return NextResponse.json({ 
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al eliminar la marca'
        }, { status: 500 })
    }
}