import { NextResponse } from "next/server";
import db from "@/lib/pg";

export async function GET() {

    try {
        const query = `
            SELECT 
                id_marca,
                nombre_marca
            FROM marca tc 
            ORDER BY tc.nombre_marca ASC
        `;

        const result = await db.query(query);

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


export async function POST(request: Request) {
    try {

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

        const createQuery = `INSERT INTO marca(nombre_marca) VALUES ($1)`;

        const updateResult = await db.query(createQuery, [nombreTrim]);

        if (updateResult.rowCount === 0) {
            return NextResponse.json(
                { error: "Marca no encontrada" },
                { status: 404 }
            );
        }

        const selectQuery = `
            SELECT id_marca, nombre_marca
                FROM marca
                WHERE nombre_marca = $1
        `;

        const result = await db.query(selectQuery, [nombreTrim]);
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
