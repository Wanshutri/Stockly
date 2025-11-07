"use client";

import { useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import TableToolbar from "../layout/TableToolBar";
import { Box, CircularProgress } from "@mui/material";

interface GenericTableProps {
    columnsDef: GridColDef[];
    apiUrl: string; // 👈 URL de la API (ej: "/api/producto")
}

export default function GenericTable({ columnsDef, apiUrl }: GenericTableProps) {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(apiUrl);
                if (!res.ok) throw new Error(`Error al obtener datos desde ${apiUrl}`);
                const data = await res.json();

                // Detecta si los datos están en un campo (ej: data.productos o data.categorias)
                const key = Object.keys(data).find((k) => Array.isArray(data[k]));
                const items = key ? data[key] : Array.isArray(data) ? data : [];

                // Asegura que cada fila tenga un id único
                const rowsWithId = items.map((item: any, i: number) => ({
                    id: item.id ?? i + 1,
                    ...item,
                }));

                setRows(rowsWithId);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl]);

    useEffect( () => {
        console.log(selectedRows)
    })

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div style={{ height: 600, width: "100%" }}>
            <DataGrid
                rows={rows}
                columns={columnsDef}
                checkboxSelection
                disableRowSelectionOnClick
                disableColumnMenu
                slots={{ toolbar: TableToolbar }}
                onRowSelectionModelChange={(r : any) => {
                    const selectedIDs = r.ids
                    const selectedRowData = rows.filter((row) => selectedIDs.has(row.id));
                    setSelectedRows(selectedRowData)
                }}
            />
        </div>
    );

}
