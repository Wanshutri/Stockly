"use client"

import formatCurrency from "@/components/hooks/formatCurrency";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";

interface DataTableDashboardProps {
    compras: Compra[];
    detalles: DetalleCompra[];
}

const columns: GridColDef[] = [
    { field: "id_compra", headerName: "ID", width: 80 },
    {
        field: "fecha", headerName: "Fecha", width: 220,
        renderCell: (params: any) => {
            const raw = String(params.value ?? "");
            if (!raw) return "";

            const dateObj = new Date(raw);

            // Formato de fecha y hora en Santiago, Chile
            const fechaSantiago = dateObj.toLocaleString("es-CL", {
                dateStyle: "short",   // "dd/mm/yyyy"
                timeStyle: "medium",  // "HH:MM:SS"
                hour12: false,
                timeZone: "America/Santiago",
            });

            // Separar fecha y hora para mostrar como en tu diseño
            const [datePart, timePart] = fechaSantiago.split(", ");

            return (
                <div className="text-xs leading-tight">
                    <div className="font-medium text-gray-800">{datePart}</div>
                    <div className="text-gray-500">{timePart}</div>
                </div>
            );
        },
    },

    {
        field: "total", headerName: "Total", width: 130,
        renderCell: (params) => (
            <span className="font-semibold text-sky-700">
                {formatCurrency(Number(params.value))}
            </span>
        ),
    },
    {
        field: "itemCount", headerName: "Ítems", type: "number", width: 90, align: "center", headerAlign: "center",
    },
    {
        field: "monto_efectivo", headerName: "Efectivo", width: 130,
        renderCell: (params) => (
            <span className="text-emerald-700 font-medium">
                {formatCurrency(Number(params.value))}
            </span>
        ),
    },
    {
        field: "monto_tarjeta", headerName: "Tarjeta", width: 130,
        renderCell: (params) => (
            <span className="text-indigo-700 font-medium">
                {formatCurrency(Number(params.value))}
            </span>
        ),
    },
];


export default function DataTableDashboard({ compras, detalles }: DataTableDashboardProps) {

    const rows = useMemo(() => {
        if (!compras) return [];
        return compras.map((venta: any) => ({
            id: venta.id_compra,
            id_compra: venta.id_compra,
            fecha: venta.fecha,
            total: Number(venta.total),
            // Opcional: aquí podrías usar la suma de cantidades si quieres
            itemCount: detalles.length,
            monto_efectivo: Number(venta.monto_efectivo),
            monto_tarjeta: Number(venta.monto_tarjeta),
        }));
    }, [compras]);

    return (
        <DataGrid
            rows={rows}
            columns={columns}
            pageSizeOptions={[5, 10]}
            initialState={{
                pagination: { paginationModel: { pageSize: 5, page: 0 } },
            }}
            disableRowSelectionOnClick
            sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: "bold",
                    color: "#4B5563",
                },
                "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#F9FAFB",
                },
            }}
        />
    );
}
