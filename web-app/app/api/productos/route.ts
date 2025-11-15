import { NextResponse } from "next/server";
import db from "@/lib/pg";
import { z } from "zod";

export const productoSchema = z.object({
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

    id_categoria: z
        .number()
        .int("La categoría debe ser un número entero"),

    id_marca: z
        .number()
        .int("La marca debe ser un número entero"),

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

export async function GET() {
    try {
        const query = `
            SELECT 
                p.sku,
                p.nombre,
                p.gtin,
                p.precio_venta,
                p.precio_compra,
                p.stock,

                c.id_categoria,
                c.nombre_categoria,

                m.id_marca,
                m.nombre_marca
            FROM producto p
            JOIN tipo_categoria c ON p.id_categoria = c.id_categoria
            JOIN marca m ON p.id_marca = m.id_marca
            ORDER BY p.nombre ASC
        `;

        const result = await db.query(query);

        const productos: Producto[] = result.rows.map(row => ({
            sku: row.sku?.trim(), // trim agregado
            nombre: row.nombre?.trim(), // trim agregado
            gtin: row.gtin?.trim() || null, // trim agregado
            precio_venta: row.precio_venta,
            precio_compra: row.precio_compra,
            stock: row.stock,
            categoria: {
                id_categoria: row.id_categoria,
                nombre_categoria: row.nombre_categoria?.trim() // trim agregado
            },
            marca: {
                id_marca: row.id_marca,
                nombre_marca: row.nombre_marca?.trim() // trim agregado
            }
        }));

        return NextResponse.json(productos, { status: 200 });

    } catch (error) {
        console.error("Error en GET /productos:", error);

        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}


export async function POST(request: Request) {
    try {
        const {
            sku,
            gtin,
            nombre,
            id_categoria,
            id_marca,
            precio_venta,
            precio_compra,
            stock
        } = await request.json();

        const parsed = productoSchema.safeParse({
            sku,
            gtin,
            nombre,
            id_categoria,
            id_marca,
            precio_venta,
            precio_compra,
            stock
        });

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Datos inválidos", detalles: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const catExists = await db.query(
            'SELECT 1 FROM tipo_categoria WHERE id_categoria = $1',
            [id_categoria]
        );

        if (catExists.rowCount === 0) {
            return NextResponse.json(
                { error: "La categoría no existe" },
                { status: 400 }
            );
        }

        const marcaExists = await db.query(
            'SELECT 1 FROM marca WHERE id_marca = $1',
            [id_marca]
        );

        if (marcaExists.rowCount === 0) {
            return NextResponse.json(
                { error: "La marca no existe" },
                { status: 400 }
            );
        }

        // 1. Insertar producto
        const insertQuery = `
            INSERT INTO producto (
                sku, gtin, nombre, id_categoria, id_marca, 
                precio_venta, precio_compra, stock
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        const insertValues = [
            sku,
            gtin,
            nombre,
            id_categoria,
            id_marca,
            precio_venta,
            precio_compra,
            stock ?? 0
        ];

        await db.query(insertQuery, insertValues);

        // 2. Obtener producto con categoría y marca
        const selectQuery = `
            SELECT 
                p.sku,
                p.nombre,
                p.gtin,
                p.precio_venta,
                p.precio_compra,
                p.stock,

                c.id_categoria,
                c.nombre_categoria,

                m.id_marca,
                m.nombre_marca
            FROM producto p
            JOIN tipo_categoria c ON p.id_categoria = c.id_categoria
            JOIN marca m ON p.id_marca = m.id_marca
            WHERE p.sku = $1
        `;

        const result = await db.query(selectQuery, [sku]);

        const row = result.rows[0];

        const response: Producto = {
            sku: row.sku?.trim(), // trim agregado
            nombre: row.nombre?.trim(), // trim agregado
            gtin: row.gtin?.trim() || null, // trim agregado
            precio_venta: row.precio_venta,
            precio_compra: row.precio_compra,
            stock: row.stock,
            categoria: {
                id_categoria: row.id_categoria,
                nombre_categoria: row.nombre_categoria?.trim() // trim agregado
            },
            marca: {
                id_marca: row.id_marca,
                nombre_marca: row.nombre_marca?.trim() // trim agregado
            }
        };

        return NextResponse.json(response, { status: 201 });

    } catch (error: any) {
        console.error("Error en POST /productos:", error);

        if (error.code === "23505") {
            return NextResponse.json(
                { error: "El SKU ya está registrado" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
