import { NextResponse } from "next/server";
import db from "@/lib/pg";
import z from "zod";

const CategoriaSchema = z.object({
  id_categoria: z.number().int().positive(),
  nombre_categoria: z.string().min(1),
});

const MarcaSchema = z.object({
  id_marca: z.number().int().positive(),
  nombre_marca: z.string().min(1),
});

const ProductoSchema = z.object({
  sku: z.string().min(1),
  nombre: z.string().min(1),
  gtin: z.string().optional(),
  precio_venta: z.number().nonnegative(),
  precio_compra: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  categoria: CategoriaSchema,
  marca: MarcaSchema,
});

const DetalleCompraSchema = z.object({
  producto: ProductoSchema,
  cantidad: z.number().int().positive(),
  subtotal: z.number().nonnegative(),
})

const CompraSchema = z.object({
  total: z.number().positive(),
  monto_tarjeta: z.number().positive().optional().nullable(),
  monto_efectivo: z.number().positive().optional().nullable(),
  detalles: z.array(DetalleCompraSchema).min(1)
});

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM compra");
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error("Error en GET /compra:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    //await db.query("BEGIN");
    try {
        const body = await request.json();
        const parse = CompraSchema.safeParse(body);

        if(!parse.success) return NextResponse.json({error: parse.error.flatten()}, {status: 400});

        const { total, monto_tarjeta, monto_efectivo } = parse.data;
        


        const queryCompra = `
            INSERT INTO compra (total, monto_tarjeta, monto_efectivo)
            VALUES ($1, $2, $3)
            RETURNING id_compra, fecha, total, monto_tarjeta, monto_efectivo
        `;

        const resultCompra = await db.query(queryCompra, [ total,  monto_tarjeta, monto_efectivo]);
        //TODO detalle_compra 
        //await db.query("COMMIT");

        return NextResponse.json(resultCompra.rows, { status: 201 });
    } catch (error) {
        console.error("Error en POST /compras:", error);

        return NextResponse.json(
            { error: error },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    context: { params: { id: string } }
) {
    const { id } = context.params;

    return NextResponse.json(
        { message: `Usuario con id ${id} actualizado` },
        { status: 200 }
    );
}

export async function DELETE(
    request: Request,
    context: { params: { id: string } }
) {
    const { id } = context.params;

    return NextResponse.json(
        { message: `Usuario con id ${id} eliminado` },
        { status: 200 }
    );
}
