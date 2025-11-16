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

const productoSchema = z.object({
    sku: z
        .string()
        .trim()
        .min(3, "SKU debe tener al menos 3 caracteres"),
    gtin: z
        .string()
        .trim()
        .min(3, "GTIN debe tener al menos 3 caracteres")
        .optional()
        .nullable(),
    nombre: z
        .string()
        .trim()
        .min(3, "El nombre debe tener al menos 3 caracteres"),
    categoria: CategoriaSchema,
    marca: MarcaSchema,
    precio_venta: z
        .number()
        .nonnegative("El precio de venta no puede ser negativo"),
    precio_compra: z
        .number()
        .nonnegative("El precio de compra no puede ser negativo"),
    stock: z
        .number()
        .int("El stock debe ser un número entero")
        .nonnegative("El stock no puede ser negativo")
        .optional()
});


const DetalleCompraSchema = z.object({
    producto: productoSchema,
    cantidad: z.number().int().positive(),
    subtotal: z.number().nonnegative(),
})

const CompraSchema = z.object({
    total: z.number().positive(),
    monto_tarjeta: z.number().nonnegative().optional().nullable(),
    monto_efectivo: z.number().nonnegative().optional().nullable(),
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
    try {
        await db.query("BEGIN");

        const body = await request.json();
        const parse = CompraSchema.safeParse(body);

        if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

        // Insert en Compras

        const { total, monto_tarjeta, monto_efectivo } = parse.data;

        if (total != ((monto_tarjeta || 0) + (monto_efectivo || 0))) {
            return NextResponse.json(
                { error: "Total no coincide con el monto pagado" },
                { status: 400 }
            );
        }

        const queryCompra = `
            INSERT INTO compra (total, monto_tarjeta, monto_efectivo)
            VALUES ($1, $2, $3)
            RETURNING id_compra, fecha, total, monto_tarjeta, monto_efectivo
        `;

        const resultCompra = await db.query(queryCompra, [total, monto_tarjeta, monto_efectivo]);

        // Insert en Detalle Compra

        //
        const COLS_PER_ROW = 9;
        const placeholders: string[] = [];
        const values: any[] = [];

        const id_compra = resultCompra.rows[0].id_compra;

        parse.data.detalles.forEach((d, rowIndex) => {
            const base = rowIndex * COLS_PER_ROW;

            placeholders.push(
                `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`
            );

            const p = d.producto;
            values.push(
                id_compra,                    // id_compra
                p.sku,                        // sku_producto
                d.cantidad,                   // cantidad
                d.subtotal,                   // subtotal
                p.nombre,                     // nombre_producto
                p.gtin ?? null,               // gtin_producto
                p.precio_venta,               // precio_unitario
                p.marca.nombre_marca,         // marca_producto
                p.categoria.nombre_categoria  // categoria_producto
            );
        })

        const queryDetalleCompra = `
            INSERT INTO detalle_compra(
                id_compra, sku_producto, cantidad, subtotal, nombre_producto,
                gtin_producto, precio_unitario, marca_producto, categoria_producto)
            VALUES ${placeholders.join(", ")}
            RETURNING *;
            
        `

        const resultDetalleCompra = await db.query(queryDetalleCompra, values);
        const insertedDetalleCompraRow = resultDetalleCompra.rows;

        await db.query("COMMIT");

        return NextResponse.json({ compra: resultCompra.rows, detalles: insertedDetalleCompraRow }, { status: 201 });
    } catch (error) {
        console.error("Error en POST /compras:", error);

        return NextResponse.json(
            { error: error },
            { status: 500 }
        );
    }
}