import { NextResponse } from "next/server";
import db from "@/lib/pg";

export async function GET(
    request: Request,
    { params }: { params: { sku: string } }
) {
    const p = await params;
    const skuOriginal = p.sku?.trim(); // trim agregado

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
            WHERE p.sku = $1
            ORDER BY p.nombre ASC
        `;

        const result = await db.query(query, [skuOriginal]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Producto no encontrado" },
                { status: 404 }
            );
        }

        const productos: Producto[] = result.rows.map(row => ({
            sku: row.sku?.trim(),
            nombre: row.nombre?.trim(),
            gtin: row.gtin?.trim() || null,
            precio_venta: row.precio_venta,
            precio_compra: row.precio_compra,
            stock: row.stock,
            categoria: {
                id_categoria: row.id_categoria,
                nombre_categoria: row.nombre_categoria?.trim()
            },
            marca: {
                id_marca: row.id_marca,
                nombre_marca: row.nombre_marca?.trim()
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


export async function PUT(
    request: Request,
    { params }: { params: { sku: string } }
) {
    try {
        const p = await params;
        const skuOriginal = p.sku?.trim(); // trim agregado

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

        const skuTrim = sku?.trim();
        const nombreTrim = nombre?.trim();
        const gtinTrim = gtin?.trim() || null;

        if (!nombreTrim || !id_categoria || !id_marca || precio_venta == null || precio_compra == null) {
            return NextResponse.json(
                { error: "Faltan campos obligatorios" },
                { status: 400 }
            );
        }

        // SKU final (nuevo o el mismo)
        const skuFinal = skuTrim && skuTrim !== "" ? skuTrim : skuOriginal;

        // Verificar si el nuevo SKU ya existe en otro producto
        if (skuFinal !== skuOriginal) {
            const existsQuery = `
                SELECT sku 
                FROM producto 
                WHERE sku = $1
            `;
            const existsResult = await db.query(existsQuery, [skuFinal]);

            if (existsResult.rowCount || 0 > 0) {
                return NextResponse.json(
                    { error: "El SKU ya está registrado por otro producto" },
                    { status: 409 }
                );
            }
        }

        const updateQuery = `
            UPDATE producto SET
                sku = $1,
                gtin = $2,
                nombre = $3,
                id_categoria = $4,
                id_marca = $5,
                precio_venta = $6,
                precio_compra = $7,
                stock = $8
            WHERE sku = $9
            RETURNING sku
        `;

        const updateValues = [
            skuFinal,
            gtinTrim,
            nombreTrim,
            id_categoria,
            id_marca,
            precio_venta,
            precio_compra,
            stock ?? 0,
            skuOriginal
        ];

        const updateResult = await db.query(updateQuery, updateValues);

        if (updateResult.rowCount === 0) {
            return NextResponse.json(
                { error: "Producto no encontrado" },
                { status: 404 }
            );
        }

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

        const result = await db.query(selectQuery, [skuFinal]);
        const row = result.rows[0];

        const response: Producto = {
            sku: row.sku?.trim(),
            nombre: row.nombre?.trim(),
            gtin: row.gtin?.trim() || null,
            precio_venta: row.precio_venta,
            precio_compra: row.precio_compra,
            stock: row.stock,
            categoria: {
                id_categoria: row.id_categoria,
                nombre_categoria: row.nombre_categoria?.trim()
            },
            marca: {
                id_marca: row.id_marca,
                nombre_marca: row.nombre_marca?.trim()
            }
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error: any) {
        console.error("Error en PUT /productos:", error);

        if (error.code === "23505") {
            return NextResponse.json(
                { error: "Error de clave duplicada en la base de datos" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { sku: string } }
) {
    try {
        const p = await params;
        const sku = p.sku?.trim(); // trim agregado

        // Verificar si el SKU existe
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

        const selectResult = await db.query(selectQuery, [sku]);

        if (selectResult.rowCount === 0) {
            return NextResponse.json(
                { error: "Producto no encontrado" },
                { status: 404 }
            );
        }

        const row = selectResult.rows[0];

        const deletedProduct: Producto = {
            sku: row.sku?.trim(),
            nombre: row.nombre?.trim(),
            gtin: row.gtin?.trim() || null,
            precio_venta: row.precio_venta,
            precio_compra: row.precio_compra,
            stock: row.stock,
            categoria: {
                id_categoria: row.id_categoria,
                nombre_categoria: row.nombre_categoria?.trim()
            },
            marca: {
                id_marca: row.id_marca,
                nombre_marca: row.nombre_marca?.trim()
            }
        };

        // Eliminar el producto
        const deleteQuery = `DELETE FROM producto WHERE sku = $1`;
        await db.query(deleteQuery, [sku]);

        return NextResponse.json(deletedProduct, { status: 200 });

    } catch (error: any) {
        console.error("Error en DELETE /productos:", error);

        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
