import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ==================================================
//  /api/ventas (GET y POST)
// ==================================================

const ventaSchema = z.object({
  detalles: z.array(
    z.object({
      sku: z.string(),
      cantidad: z.number().min(1)
    })
  ),
  pago: z.object({
    monto_efectivo: z.number().optional(),
    monto_tarjeta: z.number().optional()
  }).optional(),
  fecha: z.string().optional()
});

/**
 * GET /api/ventas
 * Lista todas las ventas con sus relaciones, incluyendo producto y nombre de categoría.
 */
export async function GET() {
  try {
    const ventas = await prisma.compra.findMany({
      orderBy: { id_compra: "desc" },
      include: {
        pago: true,
        detalles_compra: {
          include: {
            producto: {
              include: {
                tipo_categoria: true,
                marca: true
              }
            }
          }
        },
        documento_tributario: { include: { tipo_documento: true } },
      },
    });

    if (!ventas || ventas.length === 0) {
      return NextResponse.json(
        { message: "No se encontraron ventas." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ventas }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/ventas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


/**
 * POST /api/ventas
 * Crea una nueva venta con validación y transacción.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validacion = ventaSchema.safeParse(body);

    if (!validacion.success) {
      return NextResponse.json(
        { error: "Datos inválidos", detalles: validacion.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validacion.data;

    // Calcular subtotales desde la BD
    const detallesConSubtotal = await Promise.all(
      data.detalles.map(async (d) => {
        const producto = await prisma.producto.findUnique({
          where: { sku: d.sku },
          select: { precio_compra: true }
        });

        if (!producto) throw new Error(`Producto con SKU "${d.sku}" no encontrado`);

        const subtotal = Number(producto.precio_compra) * d.cantidad;

        return {
          sku: d.sku,
          cantidad: d.cantidad,
          subtotal
        };
      })
    );

    // Total de la compra
    const totalCalculado = detallesConSubtotal.reduce((acc, d) => acc + d.subtotal, 0);

    // Transacción: crear Pago + Compra + Detalles
    const compraCreada = await prisma.$transaction(async (tx) => {
      const pago = await tx.pago.create({ data: data.pago || {} });

      const compra = await tx.compra.create({
        data: {
          fecha: data.fecha ? new Date(data.fecha) : new Date(),
          total: totalCalculado,
          id_pago: pago.id_pago,
          detalles_compra: {
            create: detallesConSubtotal.map(d => ({
              sku: d.sku,
              cantidad: d.cantidad,
              subtotal: d.subtotal
            }))
          }
        },
        include: {
          pago: true,
          detalles_compra: { include: { producto: true } }
        }
      });

      return compra;
    });

    return NextResponse.json({ compra: compraCreada }, { status: 201 });

  } catch (error: any) {
    console.error("Error en POST /api/ventas:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}