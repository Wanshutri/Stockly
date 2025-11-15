import { NextResponse } from "next/server";
import db from "@/lib/pg";

export async function GET(
    request: Request,
    { params }: { params: { id_categoria: string } }
) {
    const p = await params
    const id_categoria = p.id_categoria;

    try {
        const query = `
            SELECT 
                id_categoria,
                nombre_categoria
            FROM tipo_categoria tc 
            WHERE tc.id_categoria = $1
            ORDER BY tc.nombre_categoria ASC
        `;

        const result = await db.query(query, [id_categoria]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Categoria no encontrada" },
                { status: 404 }
            );
        }

        const categorias: Categoria[] = result.rows.map(row => ({
            id_categoria: row.id_categoria,
            nombre_categoria: row.nombre_categoria?.trim() // trim agregado
        }));

        return NextResponse.json(categorias, { status: 200 });

    } catch (error) {
        console.error("Error en GET /Categorias:", error);

        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}


export async function PUT(
    request: Request,
    { params }: { params: { id_categoria: number } }
) {
    try {
        const p = await params
        const id_categoria = p.id_categoria;

        const {
            nombre_categoria
        } = await request.json();

        const nombreTrim = nombre_categoria?.trim(); // trim agregado

        if (!nombreTrim) {
            return NextResponse.json(
                { error: "Faltan campos obligatorios" },
                { status: 400 }
            );
        }

        // Verificar si ya existe
        if (nombreTrim) {
            const existsQuery = `
                SELECT nombre_categoria
                FROM tipo_categoria
                WHERE nombre_categoria = $1
            `;
            const existsResult = await db.query(existsQuery, [nombreTrim]);

            if (existsResult.rowCount || 0 > 0) {
                return NextResponse.json(
                    { error: "La categoria ya existe" },
                    { status: 409 }
                );
            }
        }

        const updateQuery = `
            UPDATE tipo_categoria SET
                nombre_categoria = $1
            WHERE id_categoria = $2
            RETURNING id_categoria, nombre_categoria
        `;

        const updateValues = [
            nombreTrim,
            id_categoria
        ];

        const updateResult = await db.query(updateQuery, updateValues);

        if (updateResult.rowCount === 0) {
            return NextResponse.json(
                { error: "Categoria no encontrada" },
                { status: 404 }
            );
        }

        const selectQuery = `
            SELECT 
                id_categoria,
                nombre_categoria
            FROM tipo_categoria tc 
            WHERE tc.id_categoria = $1
            ORDER BY tc.nombre_categoria ASC
        `;

        const result = await db.query(selectQuery, [id_categoria]);
        const row = result.rows[0];

        const response: Categoria = {
            id_categoria: row.id_categoria,
            nombre_categoria: row.nombre_categoria?.trim() // trim agregado
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error: any) {
        console.error("Error en PUT /categorias:", error);

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
    { params }: { params: { id_categoria: string } }
) {
    try {
        const p = await params
        const id_categoria = p.id_categoria;

        // Verificar si existe
        const selectQuery = `
            SELECT 
                id_categoria,
                nombre_categoria
            FROM tipo_categoria tc 
            WHERE tc.id_categoria = $1
            ORDER BY tc.nombre_categoria ASC
        `;

        const selectResult = await db.query(selectQuery, [id_categoria]);

        if (selectResult.rowCount === 0) {
            return NextResponse.json(
                { error: "Categoria no encontrada" },
                { status: 404 }
            );
        }

        const row = selectResult.rows[0];

        const deletedCategory: Categoria = {
            id_categoria : row.id_categoria,
            nombre_categoria : row.nombre_categoria?.trim() // trim agregado
        };

        // Eliminar categoria
        const deleteQuery = `DELETE FROM tipo_categoria WHERE id_categoria = $1`;
        await db.query(deleteQuery, [id_categoria]);

        return NextResponse.json(deletedCategory, { status: 200 });

    } catch (error: any) {
        console.error("Error en DELETE /categorias:", error);

        if (error.code === "23503") {
            return NextResponse.json(
                { error: "No se puede eliminar porque tiene productos asociados" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
