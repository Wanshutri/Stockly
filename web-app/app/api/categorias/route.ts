import { NextResponse } from "next/server";
import db from "@/lib/pg";

export async function GET() {

    try {
        const query = `
            SELECT 
                id_categoria,
                nombre_categoria
            FROM tipo_categoria tc 
            ORDER BY tc.nombre_categoria ASC
        `;

        const result = await db.query(query);

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
        console.error("Error en GET /categorias:", error);

        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}


export async function POST(request: Request) {
    try {

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

        const createQuery = `INSERT INTO tipo_categoria(nombre_categoria) VALUES ($1)`;

        const updateResult = await db.query(createQuery, [nombreTrim]);

        if (updateResult.rowCount === 0) {
            return NextResponse.json(
                { error: "Categoria no encontrada" },
                { status: 404 }
            );
        }

        const selectQuery = `
            SELECT id_categoria, nombre_categoria
                FROM tipo_categoria
                WHERE nombre_categoria = $1
        `;

        const result = await db.query(selectQuery, [nombreTrim]);
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
