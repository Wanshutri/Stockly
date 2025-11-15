import { NextResponse } from "next/server";
import db from "@/lib/pg";

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

        const skuTrim = sku?.trim(); // trim agregado
        const nombreTrim = nombre?.trim(); // trim agregado
        const gtinTrim = gtin?.trim() || null; // trim agregado

        if (!skuTrim || !nombreTrim || !id_categoria || !id_marca || precio_venta == null || precio_compra == null) {
            return NextResponse.json(
                { error: "Faltan campos obligatorios" },
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
            skuTrim,
            gtinTrim,
            nombreTrim,
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

        const result = await db.query(selectQuery, [skuTrim]);

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
