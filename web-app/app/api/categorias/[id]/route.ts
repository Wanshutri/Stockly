import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

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

// GET /api/categorias/[id] - Obtener una categoría por ID
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const idNum = Number(id)
    if (Number.isNaN(idNum)) {
      return NextResponse.json(
        { error: 'ID inválido', message: 'El id proporcionado no es un número válido' },
        { status: 400 }
      )
    }

    const categoria = await prisma.tipoCategoria.findUnique({
      where: { id_categoria: idNum },
      select: {
        id_categoria: true,
        nombre_categoria: true
      }
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'No encontrado', message: 'La categoría especificada no existe' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { categoria, message: 'Categoría encontrada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al obtener categoría:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', message: 'Ocurrió un error al obtener la categoría' },
      { status: 500 }
    )
  }
}

// PUT /api/categorias/[id] - Actualizar una categoría
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const idNum = Number(id)
    if (Number.isNaN(idNum)) {
      return NextResponse.json(
        { error: 'ID inválido', message: 'El id proporcionado no es un número válido' },
        { status: 400 }
      )
    }

    // Verificar si la categoría existe
    const existingCategoria = await prisma.tipoCategoria.findUnique({
      where: { id_categoria: idNum }
    })

    if (!existingCategoria) {
      return NextResponse.json(
        { error: 'No encontrado', message: 'La categoría especificada no existe' },
        { status: 404 }
      )
    }

    const body = await req.json()

    // Asegurarse de que nombre_categoria sea string | undefined
    const nombreRaw = typeof body?.nombre_categoria === 'string' ? body.nombre_categoria : undefined
    const errors = validateCategoriaInput(nombreRaw)
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Error de validación', errors }, { status: 400 })
    }

    const trimmedName = nombreRaw!.trim()

    // Verificar si ya existe otra categoría con el mismo nombre (ignorando mayúsculas)
    const duplicateCategoria = await prisma.tipoCategoria.findFirst({
      where: {
        nombre_categoria: {
          equals: trimmedName,
          mode: 'insensitive'
        },
        NOT: {
          id_categoria: idNum
        }
      }
    })

    if (duplicateCategoria) {
      return NextResponse.json(
        { error: 'Categoría duplicada', message: 'Ya existe otra categoría con ese nombre' },
        { status: 409 }
      )
    }

    const categoria = await prisma.tipoCategoria.update({
      where: { id_categoria: idNum },
      data: { nombre_categoria: trimmedName },
      include: {
        _count: {
          select: { productos: true }
        }
      }
    })

    return NextResponse.json(
      { categoria, message: 'Categoría actualizada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'No encontrado', message: 'La categoría especificada no existe' },
          { status: 404 }
        )
      }
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Categoría duplicada', message: 'Ya existe otra categoría con ese nombre' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Error en la base de datos', message: 'Error al actualizar la categoría en la base de datos' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Error interno del servidor', message: 'Ocurrió un error al actualizar la categoría' },
      { status: 500 }
    )
  }
}

// DELETE /api/categorias/[id] - Eliminar una categoría
export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const params = await context.params
  const { id } = params
    const idNum = Number(id)
    if (Number.isNaN(idNum)) {
      return NextResponse.json(
        { error: 'ID inválido', message: 'El id proporcionado no es un número válido' },
        { status: 400 }
      )
    }

    // Verificar si la categoría existe y obtener productos asociados
    const categoria = await prisma.tipoCategoria.findUnique({
      where: { id_categoria: idNum },
      include: {
        _count: {
          select: { productos: true }
        }
      }
    })

    if (!categoria) {
      return NextResponse.json(
        { error: 'No encontrado', message: 'La categoría especificada no existe' },
        { status: 404 }
      )
    }

    // Verificar si la categoría tiene productos asociados
    if (categoria._count.productos > 0) {
      return NextResponse.json(
        {
          error: 'Conflicto de dependencia',
          message: 'No se puede eliminar la categoría porque tiene productos asociados',
          productosAsociados: categoria._count.productos
        },
        { status: 409 }
      )
    }

    // Eliminar la categoría
    await prisma.tipoCategoria.delete({
      where: { id_categoria: idNum }
    })

    return NextResponse.json({ message: 'Categoría eliminada exitosamente' }, { status: 200 })
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'No encontrado', message: 'La categoría especificada no existe' },
          { status: 404 }
        )
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: 'Conflicto de dependencia', message: 'No se puede eliminar la categoría porque tiene productos asociados' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Error en la base de datos', message: 'Error al eliminar la categoría en la base de datos' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Error interno del servidor', message: 'Ocurrió un error al eliminar la categoría' },
      { status: 500 }
    )
  }
}
