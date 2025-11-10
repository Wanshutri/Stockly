import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import type { ProductoType } from '@/types/db'

/**
 * Esquema de validación parcial para actualización de producto (PUT)
 */
const productoUpdateSchema = z.object({
  nombre: z.string().min(1, 'El nombre no puede estar vacío').optional(),
  id_categoria: z.number().int().positive('La categoría debe ser un número positivo').optional(),
  id_marca: z.number().int().positive('La marca debe ser un número positivo').optional(),
  precio_venta: z.number().positive('El precio de venta debe ser mayor que 0').optional(),
  precio_compra: z.number().positive('El precio de compra debe ser mayor que 0').optional(),
  descripcion: z.string().min(1, 'La descripción es obligatoria').optional(),
  stock: z.number().int().nonnegative('El stock no puede ser negativo').optional()
})

/**
 * GET /api/productos/[sku]
 * Obtiene un producto específico por su SKU
 */
export async function GET(_req: Request, context: { params: { sku: string } }) {
  try {
    const { sku } = await context.params

    // Validar SKU
    if (!/^[A-Za-z0-9-]{1,50}$/.test(sku)) {
      return NextResponse.json({ error: 'SKU inválido. Debe ser alfanumérico y máximo 50 caracteres.' }, { status: 400 })
    }

    const producto = await prisma.producto.findUnique({
      where: { sku },
      select: {
        sku: true,
        nombre: true,
        precio_venta: true,
        precio_compra: true,
        descripcion: true,
        stock: true,
        marca: true,
        tipo_categoria: true
      }
    })

    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }


    return NextResponse.json({ producto }, { status: 200 })
  } catch (error) {
    console.error('Error en GET /api/productos/[sku]:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * PUT /api/productos/[sku]
 * Actualiza un producto existente, validando datos y referencias
 */
export async function PUT(req: Request, context: { params: { sku: string } }) {
  try {
    const { sku } = await context.params

    if (!/^[A-Za-z0-9-]{1,50}$/.test(sku)) {
      return NextResponse.json({ error: 'SKU inválido. Debe ser alfanumérico y máximo 50 caracteres.' }, { status: 400 })
    }

    const productoExistente = await prisma.producto.findUnique({ where: { sku } })
    if (!productoExistente) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    const body = await req.json()
    const validacion = productoUpdateSchema.safeParse(body)
    if (!validacion.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', detalles: validacion.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = validacion.data

    // Validar existencia de marca y categoría (si se envían)
    if (data.id_categoria) {
      const categoria = await prisma.tipoCategoria.findUnique({
        where: { id_categoria: data.id_categoria }
      })
      if (!categoria) {
        return NextResponse.json({ error: 'La categoría especificada no existe' }, { status: 404 })
      }
    }

    if (data.id_marca) {
      const marca = await prisma.marca.findUnique({
        where: { id_marca: data.id_marca }
      })
      if (!marca) {
        return NextResponse.json({ error: 'La marca especificada no existe' }, { status: 404 })
      }
    }

    const productoActualizado = await prisma.producto.update({
      where: { sku },
      data,
      include: {
        marca: true,
        tipo_categoria: true
      }
    })

    const producto: ProductoType = {
      sku: productoActualizado.sku,
      nombre: productoActualizado.nombre,
      precio_venta: Number(productoActualizado.precio_venta),
      precio_compra: Number(productoActualizado.precio_compra),
      descripcion: productoActualizado.descripcion,
      stock: productoActualizado.stock,
      marca: productoActualizado.marca,
      tipo_categoria: productoActualizado.tipo_categoria
    }

    return NextResponse.json({ producto }, { status: 200 })
  } catch (error) {
    console.error('Error en PUT /api/productos/[sku]:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

/**
 * DELETE /api/productos/[sku]
 * Elimina un producto si no tiene dependencias
 */
export async function DELETE(_req: Request, context: { params: { sku: string } }) {
  try {
    const { sku } = await context.params

    if (!/^[A-Za-z0-9-]{1,50}$/.test(sku)) {
      return NextResponse.json({ error: 'SKU inválido. Debe ser alfanumérico y máximo 50 caracteres.' }, { status: 400 })
    }

    const producto = await prisma.producto.findUnique({ where: { sku } })
    if (!producto) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }

    // Evitar eliminación si el producto tiene referencias
    const tieneReferencias = await prisma.detalleCompra.findFirst({ where: { sku } })
    if (tieneReferencias) {
      return NextResponse.json(
        { error: 'No se puede eliminar el producto porque tiene compras asociadas' },
        { status: 409 }
      )
    }

    await prisma.producto.delete({ where: { sku } })
    return NextResponse.json({ message: 'Producto eliminado exitosamente' }, { status: 200 })
  } catch (error) {
    console.error('Error en DELETE /api/productos/[sku]:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
