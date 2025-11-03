import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { ProductoType } from '@/types/db'

export async function GET() {
    const productos = await prisma.producto.findMany()
    return NextResponse.json({ productos })
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as Omit<ProductoType, 'tipo_categoria' | 'marca' | 'detalles_compra'>
        const producto = await prisma.producto.create({ 
            data: {
                sku: body.sku,
                nombre: body.nombre,
                id_categoria: body.id_categoria,
                id_marca: body.id_marca,
                precio_venta: body.precio_venta,
                precio_compra: body.precio_compra,
                descripcion: body.descripcion,
                stock: body.stock
            }
        })
        return NextResponse.json({ producto })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'server_error' }, { status: 500 })
    }
}
