import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// ==================================================
//  /api/ventas/[id] (GET, PUT, DELETE)
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
  pago: pagoSchema.optional(),
  detalles: z.array(detalleSchema).optional(),
  documento: z
    .object({ id_tipo: z.string().length(3, "Código de tipo inválido") })
    .optional(),
});

const ventaUpdateSchema = ventaSchema.partial();

/**
 * GET /api/ventas/[id]
 * Obtiene una venta por su ID.
 */
export async function GET(
  _req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params

    const venta = await prisma.compra.findUnique({
      where: { id_compra: parseInt(id) },
      include: {
        pago: true,
        detalles_compra: { include: { producto: true } },
        documento_tributario: { include: { tipo_documento: true } },
      },
    });

    if (!venta) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ venta }, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/ventas/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ventas/[id]
 * Actualiza una venta existente.
 */
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params

    const body = await req.json();
    const validacion = ventaUpdateSchema.safeParse(body);

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
    const ventaExistente = await prisma.compra.findUnique({
      where: { id_compra: parseInt(id) },
    });

    if (!ventaExistente) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      if (data.pago) {
        await tx.pago.update({
          where: { id_pago: ventaExistente.id_pago },
          data: data.pago,
        });
      }

      if (data.detalles) {
        await tx.detalleCompra.deleteMany({ where: { id_compra: parseInt(id) } });
        await tx.detalleCompra.createMany({
          data: data.detalles.map((d) => ({
            sku: d.sku,
            id_compra: parseInt(id),
            cantidad: d.cantidad,
            subtotal: d.subtotal,
          })),
        });
      }

      if (data.documento && data.documento.id_tipo) {
        const doc = await tx.documentoTributario.findUnique({
          where: { id_compra: parseInt(id) } as any,
        });
        if (doc) {
          await tx.documentoTributario.update({
            where: { id_documento: doc.id_documento },
            data: { id_tipo: data.documento.id_tipo },
          });
        } else {
          await tx.documentoTributario.create({
            data: { id_compra: parseInt(id), id_tipo: data.documento.id_tipo },
          });
        }
      }

      await tx.compra.update({
        where: { id_compra: parseInt(id) },
        data: {
          fecha: data.fecha ? new Date(data.fecha) : undefined,
          total: data.total,
        },
      });

      return tx.compra.findUnique({
        where: { id_compra: parseInt(id) },
        include: {
          pago: true,
          detalles_compra: { include: { producto: true } },
          documento_tributario: { include: { tipo_documento: true } },
        },
      });
    });

    return NextResponse.json({ venta: result }, { status: 200 });
  } catch (error) {
    console.error("Error en PUT /api/ventas/[id]:", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ventas/[id]
 * Elimina una venta con sus registros asociados.
 */
export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params

    const venta = await prisma.compra.findUnique({ where: { id_compra: parseInt(id) } });
    if (!venta) {
      return NextResponse.json(
        { error: "Venta no encontrada" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.detalleCompra.deleteMany({ where: { id_compra: parseInt(id) } });
      await tx.documentoTributario.deleteMany({ where: { id_compra: parseInt(id) } });
      await tx.compra.delete({ where: { id_compra: parseInt(id) } });
      await tx.pago.delete({ where: { id_pago: venta.id_pago } });
    });

    return NextResponse.json(
      { message: "Venta eliminada exitosamente" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en DELETE /api/ventas/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
