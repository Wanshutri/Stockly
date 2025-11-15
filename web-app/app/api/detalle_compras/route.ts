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
    monto_tarjeta: z.number().positive().optional().nullable(),
    monto_efectivo: z.number().positive().optional().nullable(),
    detalles: z.array(DetalleCompraSchema).min(1)
});

export async function GET() {
    try {
        const result = await db.query("SELECT * FROM detalle_compra");
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
    return NextResponse.json({ error: "POST No se debe crear POST" }, { status: 501 })
}