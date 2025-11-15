import { NextResponse } from "next/server";
import db from "@/lib/pg";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id_marca: string }> }
) {
    const p = await params
    const id_marca = p.id_marca;

    try {
        const query = `
            SELECT 
                id_marca,
                nombre_marca
            FROM marca tc 
            WHERE tc.id_marca = $1
            ORDER BY tc.nombre_marca ASC
        `;

        const result = await db.query(query, [id_marca]);

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Marca no encontrada" },
                { status: 404 }
            );
        }

        const marcas: Marca[] = result.rows.map(row => ({
            id_marca: row.id_marca,
            nombre_marca: row.nombre_marca?.trim() // trim agregado
        }));

        return NextResponse.json(marcas, { status: 200 });

    } catch (error) {
        console.error("Error en GET /marcas:", error);

        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}


export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id_marca: string }> }
) {
    try {
        const p = await params
        const id_marca = p.id_marca;

        const {
            nombre_marca
        } = await request.json();

        const nombreTrim = nombre_marca?.trim(); // trim agregado

        if (!nombreTrim) {
            return NextResponse.json(
                { error: "Faltan campos obligatorios" },
                { status: 400 }
            );
        }

        // Verificar si ya existe
        if (nombreTrim) {
            const existsQuery = `
                SELECT nombre_marca
                FROM marca
                WHERE nombre_marca = $1
            `;
            const existsResult = await db.query(existsQuery, [nombreTrim]);

            if (existsResult.rowCount || 0 > 0) {
                return NextResponse.json(
                    { error: "La marca ya existe" },
                    { status: 409 }
                );
            }
        }

        const updateQuery = `
            UPDATE marca SET
                nombre_marca = $1
            WHERE id_marca = $2
            RETURNING id_marca, nombre_marca
        `;

        const updateValues = [
            nombreTrim,
            id_marca
        ];

        const updateResult = await db.query(updateQuery, updateValues);

        if (updateResult.rowCount === 0) {
            return NextResponse.json(
                { error: "Marca no encontrada" },
                { status: 404 }
            );
        }

        const selectQuery = `
            SELECT 
                id_marca,
                nombre_marca
            FROM marca tc 
            WHERE tc.id_marca = $1
            ORDER BY tc.nombre_marca ASC
        `;

        const result = await db.query(selectQuery, [id_marca]);
        const row = result.rows[0];

        const response: Marca = {
            id_marca: row.id_marca,
            nombre_marca: row.nombre_marca?.trim() // trim agregado
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error: any) {
        console.error("Error en PUT /marcas:", error);

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
    { params }: { params: Promise<{ id_marca: string }> }
) {
    try {
        const p = await params
        const id_marca = p.id_marca;

        // Verificar si existe
        const selectQuery = `
            SELECT 
                id_marca,
                nombre_marca
            FROM marca tc 
            WHERE tc.id_marca = $1
            ORDER BY tc.nombre_marca ASC
        `;

        const selectResult = await db.query(selectQuery, [id_marca]);

        if (selectResult.rowCount === 0) {
            return NextResponse.json(
                { error: "Marca no encontrada" },
                { status: 404 }
            );
        }

        const row = selectResult.rows[0];

        const deletedMarca: Marca = {
            id_marca: row.id_marca,
            nombre_marca: row.nombre_marca?.trim() // trim agregado
        };

        // Eliminar marca
        const deleteQuery = `DELETE FROM marca WHERE id_marca = $1`;
        await db.query(deleteQuery, [id_marca]);

        return NextResponse.json(deletedMarca, { status: 200 });

    } catch (error: any) {
        console.error("Error en DELETE /marcas:", error);

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
