import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type Params = { params: { id: string } }

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

// GET /api/categoria/[id] - Obtener una categoría por ID
export async function GET(_req: Request, { params }: Params) {
    try {
        const id = parseInt(params.id)
        if (isNaN(id) || id < 1) {
            return NextResponse.json({
                error: 'Error de validación',
                message: 'El ID debe ser un número entero positivo'
            }, { status: 400 })
        }

        const categoria = await prisma.tipoCategoria.findUnique({
            where: { id_categoria: id },
            select: {
                id_categoria: true,
                nombre_categoria: true
            }
        })

        if (!categoria) {
            return NextResponse.json({
                error: 'No encontrado',
                message: 'La categoría especificada no existe'
            }, { status: 404 })
        }

        return NextResponse.json({
            categoria,
            message: 'Categoría encontrada exitosamente'
        }, { status: 200 })

    } catch (error) {
        console.error('Error al obtener categoría:', error)
        return NextResponse.json({
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al obtener la categoría'
        }, { status: 500 })
    }
}

// PUT /api/categoria/[id] - Actualizar una categoría
export async function PUT(req: Request, { params }: Params) {
    try {
        const id = parseInt(params.id)
        if (isNaN(id) || id < 1) {
            return NextResponse.json({
                error: 'Error de validación',
                message: 'El ID debe ser un número entero positivo'
            }, { status: 400 })
        }

        // Verificar si la categoría existe
        const existingCategoria = await prisma.tipoCategoria.findUnique({
            where: { id_categoria: id }
        })

        if (!existingCategoria) {
            return NextResponse.json({
                error: 'No encontrado',
                message: 'La categoría especificada no existe'
            }, { status: 404 })
        }

        const body = await req.json()

        // Validaciones
        const errors = validateCategoriaInput(body.nombre_categoria)
        if (errors.length > 0) {
            return NextResponse.json({
                error: 'Error de validación',
                errors
            }, { status: 400 })
        }

        // Verificar si ya existe otra categoría con el mismo nombre
        const duplicateCategoria = await prisma.tipoCategoria.findFirst({
            where: {
                nombre_categoria: {
                    equals: body.nombre_categoria.trim(),
                    mode: 'insensitive'
                },
                NOT: {
                    id_categoria: id
                }
            }
        })

        if (duplicateCategoria) {
            return NextResponse.json({
                error: 'Categoría duplicada',
                message: 'Ya existe otra categoría con ese nombre'
            }, { status: 409 })
        }

        const categoria = await prisma.tipoCategoria.update({
            where: { id_categoria: id },
            data: { nombre_categoria: body.nombre_categoria.trim() },
            include: {
                _count: {
                    select: { productos: true }
                }
            }
        })

        return NextResponse.json({
            categoria,
            message: 'Categoría actualizada exitosamente'
        }, { status: 200 })

    } catch (error) {
        console.error('Error al actualizar categoría:', error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json({
                    error: 'No encontrado',
                    message: 'La categoría especificada no existe'
                }, { status: 404 })
            }
            if (error.code === 'P2002') {
                return NextResponse.json({
                    error: 'Categoría duplicada',
                    message: 'Ya existe otra categoría con ese nombre'
                }, { status: 409 })
            }
            return NextResponse.json({
                error: 'Error en la base de datos',
                message: 'Error al actualizar la categoría en la base de datos'
            }, { status: 500 })
        }
        return NextResponse.json({
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al actualizar la categoría'
        }, { status: 500 })
    }
}

// DELETE /api/categoria/[id] - Eliminar una categoría
export async function DELETE(_req: Request, { params }: Params) {
    try {
        const id = parseInt(params.id)
        if (isNaN(id) || id < 1) {
            return NextResponse.json({
                error: 'Error de validación',
                message: 'El ID debe ser un número entero positivo'
            }, { status: 400 })
        }

        // Verificar si la categoría existe y obtener productos asociados
        const categoria = await prisma.tipoCategoria.findUnique({
            where: { id_categoria: id },
            include: {
                _count: {
                    select: { productos: true }
                }
            }
        })

        if (!categoria) {
            return NextResponse.json({
                error: 'No encontrado',
                message: 'La categoría especificada no existe'
            }, { status: 404 })
        }

        // Verificar si la categoría tiene productos asociados
        if (categoria._count.productos > 0) {
            return NextResponse.json({
                error: 'Conflicto de dependencia',
                message: 'No se puede eliminar la categoría porque tiene productos asociados',
                productosAsociados: categoria._count.productos
            }, { status: 409 })
        }

        // Eliminar la categoría
        await prisma.tipoCategoria.delete({
            where: { id_categoria: id }
        })

        return NextResponse.json({
            message: 'Categoría eliminada exitosamente'
        }, { status: 200 })

    } catch (error) {
        console.error('Error al eliminar categoría:', error)
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return NextResponse.json({
                    error: 'No encontrado',
                    message: 'La categoría especificada no existe'
                }, { status: 404 })
            }
            if (error.code === 'P2003') {
                return NextResponse.json({
                    error: 'Conflicto de dependencia',
                    message: 'No se puede eliminar la categoría porque tiene productos asociados'
                }, { status: 409 })
            }
            return NextResponse.json({
                error: 'Error en la base de datos',
                message: 'Error al eliminar la categoría en la base de datos'
            }, { status: 500 })
        }
        return NextResponse.json({
            error: 'Error interno del servidor',
            message: 'Ocurrió un error al eliminar la categoría'
        }, { status: 500 })
    }
}