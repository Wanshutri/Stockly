import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ProductoType } from '@/types/db'
import { z } from 'zod'

/**
 * Esquema de validación para la creación de productos
 */
const productoSchema = z.object({
  sku: z.string().min(1, 'El SKU es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  id_categoria: z.number().int().positive('La categoría debe ser un número positivo'),
  id_marca: z.number().int().positive('La marca debe ser un número positivo'),
  precio_venta: z.number().positive('El precio de venta debe ser mayor que 0'),
  precio_compra: z.number().positive('El precio de compra debe ser mayor que 0'),
  descripcion: z.string().min(1, 'La descripción es obligatoria'),
  stock: z.number().int().nonnegative('El stock no puede ser negativo')
})

/**
 * GET /api/productos
 * Obtiene todos los productos registrados, incluyendo nombre de marca y categoría.
 */
export async function GET() {
  try {
    const productosDB = await prisma.producto.findMany({
      select: {
        sku: true,
        nombre: true,
        precio_venta: true,
        precio_compra: true,
        descripcion: true,
        stock: true,
        marca: { select: { nombre_marca: true } },
        tipo_categoria: { select: { nombre_categoria: true } }
      }
    })

    if (!productosDB || productosDB.length === 0) {
      return NextResponse.json(
        { message: 'No se encontraron productos.' },
        { status: 404 }
      )
    }

    // Convertir los Decimals a number para que coincidan con ProductoType
    const productos: ProductoType[] = productosDB.map((p) => ({
      sku: p.sku,
      nombre: p.nombre,
      precio_venta: Number(p.precio_venta),
      precio_compra: Number(p.precio_compra),
      descripcion: p.descripcion,
      stock: p.stock,
      marca: p.marca.nombre_marca,
      tipo_categoria: p.tipo_categoria.nombre_categoria
    }))

    return NextResponse.json({ productos }, { status: 200 })
  } catch (error) {
    console.error('Error en GET /api/productos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/productos
 * Crea un nuevo producto validando los datos de entrada.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validación con Zod
    const validacion = productoSchema.safeParse(body)
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

    // Validar duplicado por SKU
    const existeSKU = await prisma.producto.findUnique({
      where: { sku: data.sku }
    })
    if (existeSKU) {
      return NextResponse.json(
        { error: 'El SKU ya está registrado' },
        { status: 409 }
      )
    }

    // Verificar existencia de categoría y marca
    const [categoria, marca] = await Promise.all([
      prisma.tipoCategoria.findUnique({ where: { id_categoria: data.id_categoria } }),
      prisma.marca.findUnique({ where: { id_marca: data.id_marca } })
    ])

    if (!categoria) {
      return NextResponse.json(
        { error: 'La categoría especificada no existe' },
        { status: 404 }
      )
    }

    if (!marca) {
      return NextResponse.json(
        { error: 'La marca especificada no existe' },
        { status: 404 }
      )
    }

    // Crear el producto
    const productoCreado = await prisma.producto.create({
      data: {
        sku: data.sku,
        nombre: data.nombre,
        id_categoria: data.id_categoria,
        id_marca: data.id_marca,
        precio_venta: data.precio_venta,
        precio_compra: data.precio_compra,
        descripcion: data.descripcion,
        stock: data.stock
      },
      include: {
        marca: { select: { nombre_marca: true } },
        tipo_categoria: { select: { nombre_categoria: true } }
      }
    })

    // Formatear salida
    const producto: ProductoType = {
      sku: productoCreado.sku,
      nombre: productoCreado.nombre,
      precio_venta: Number(productoCreado.precio_venta),
      precio_compra: Number(productoCreado.precio_compra),
      descripcion: productoCreado.descripcion,
      stock: productoCreado.stock,
      marca: marca.nombre_marca,
      tipo_categoria: categoria.nombre_categoria
    }

    return NextResponse.json({ producto }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/productos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
