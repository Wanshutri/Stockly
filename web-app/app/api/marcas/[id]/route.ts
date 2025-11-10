import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import type { MarcaType } from '@/types/db'

/**
 * Esquema de validación parcial para actualización de marca
 */
const marcaUpdateSchema = z.object({
  nombre_marca: z
    .string()
    .min(1, 'El nombre de la marca es obligatorio')
    .max(100, 'El nombre no puede exceder los 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s&-]+$/, 'El nombre solo puede contener letras, números, espacios, & y guiones')
    .optional()
})

type Params = { params: { id: string } }

/**
 * GET /api/marca/[id]
 * Obtiene una marca específica por su ID
 */
export async function GET(_req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params

    const marcaDB = await prisma.marca.findUnique({
      where: { id_marca: parseInt(id) },
      include: {
        _count: { select: { productos: true } }
      }
    })

    if (!marcaDB) {
      return NextResponse.json(
        { error: 'Marca no encontrada' },
        { status: 404 }
      )
    }

    const marca: MarcaType = {
      id_marca: marcaDB.id_marca,
      nombre_marca: marcaDB.nombre_marca
    }

    return NextResponse.json({ marca }, { status: 200 })
  } catch (error) {
    console.error('Error en GET /api/marca/[id]:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/marca/[id]
 * Actualiza una marca existente, validando datos y duplicados
 */
export async function PUT(_req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params

    const marcaExistente = await prisma.marca.findUnique({ where: { id_marca: parseInt(id) } })
    if (!marcaExistente) {
      return NextResponse.json(
        { error: 'Marca no encontrada' },
        { status: 404 }
      )
    }

    const body = await _req.json()
    const validacion = marcaUpdateSchema.safeParse(body)
    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', detalles: validacion.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validacion.data

    if (data.nombre_marca) {
      const nombreTrimmed = data.nombre_marca.trim()

      // Verificar duplicado
      const duplicada = await prisma.marca.findFirst({
        where: {
          nombre_marca: {
            equals: nombreTrimmed,
            mode: 'insensitive'
          },
          NOT: { id_marca: parseInt(id) }
        }
      })

      if (duplicada) {
        return NextResponse.json(
          { error: 'Ya existe otra marca con ese nombre' },
          { status: 409 }
        )
      }

      data.nombre_marca = nombreTrimmed
    }

    const marcaActualizada = await prisma.marca.update({
      where: { id_marca: parseInt(id) },
      data,
      include: { _count: { select: { productos: true } } }
    })

    const marca: MarcaType = {
      id_marca: marcaActualizada.id_marca,
      nombre_marca: marcaActualizada.nombre_marca
    }

    return NextResponse.json({ marca }, { status: 200 })
  } catch (error) {
    console.error('Error en PUT /api/marca/[id]:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Ya existe una marca con ese nombre' },
          { status: 409 }
        )
      }
      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Marca no encontrada' },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/marca/[id]
 * Elimina una marca si no tiene productos asociados
 */
export async function DELETE(_req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params

    const marcaDB = await prisma.marca.findUnique({
      where: { id_marca: parseInt(id) },
      include: { _count: { select: { productos: true } } }
    })

    if (!marcaDB) {
      return NextResponse.json(
        { error: 'Marca no encontrada' },
        { status: 404 }
      )
    }

    if (marcaDB._count.productos > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar la marca porque tiene productos asociados',
          productosAsociados: marcaDB._count.productos
        },
        { status: 409 }
      )
    }

    await prisma.marca.delete({ where: { id_marca: parseInt(id) } })

    return NextResponse.json(
      { message: 'Marca eliminada exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error en DELETE /api/marca/[id]:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Marca no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
