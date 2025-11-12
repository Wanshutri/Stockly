import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ==================================================
//  /api/ventas (GET y POST)
// ==================================================

// --- Esquemas Zod ---
const detalleSchema = z.object({
  sku: z.string().min(1, "El SKU es obligatorio"),
  cantidad: z.number().int().positive("La cantidad debe ser mayor que 0"),
  subtotal: z.number().positive("El subtotal debe ser mayor que 0"),
});

const pagoSchema = z.object({
  monto_efectivo: z.number().nonnegative().default(0),
  monto_tarjeta: z.number().nonnegative().default(0),
});

const ventaSchema = z.object({
  fecha: z.string().optional(),
  total: z.number().positive("El total debe ser mayor que 0"),
  pago: pagoSchema,
  detalles: z
    .array(detalleSchema)
    .nonempty("Debe incluir al menos un detalle de venta"),
  documento: z
    .object({ id_tipo: z.string().length(3, "Código de tipo inválido") })
    .optional(),
});

/**
 * GET /api/ventas
 * Lista todas las ventas con sus relaciones.
 */
export async function GET() {
  try {
    const ventas = await prisma.compra.findMany({
      orderBy: { id_compra: "desc" },
      include: {
        pago: true,
        detalles_compra: { include: { producto: true } },
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
        {
          error: "Datos inválidos",
          detalles: validacion.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validacion.data;

    const result = await prisma.$transaction(async (tx) => {
      // Crear el pago
      const pago = await tx.pago.create({ data: data.pago });

      // Crear la compra con detalles y documento opcional
      const compra = await tx.compra.create({
        data: {
          fecha: data.fecha ? new Date(data.fecha) : new Date(),
          total: data.total,
          id_pago: pago.id_pago,
          detalles_compra: {
            create: data.detalles.map((d) => ({
              sku: d.sku,
              cantidad: d.cantidad,
              subtotal: d.subtotal,
            })),
          },
          documento_tributario: data.documento
            ? { create: { id_tipo: data.documento.id_tipo } }
            : undefined,
        },
        include: {
          pago: true,
          detalles_compra: { include: { producto: true } },
          documento_tributario: { include: { tipo_documento: true } },
        },
      });

      return compra;
    });

    return NextResponse.json({ venta: result }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/ventas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
