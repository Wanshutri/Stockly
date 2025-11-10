"use client";

import { useEffect, useState, cloneElement, isValidElement } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import TableToolbar from "../ui/TableToolBar";
import {
    Box,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface GenericTableProps {
    columnsDef: GridColDef[];
    apiUrl: string;
    formulario: React.ReactElement<any>;
    title: string;
    deletionKey : string;
}

export default function GenericTable({
    columnsDef,
    apiUrl,
    formulario,
    title,
    deletionKey
}: GenericTableProps) {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const handleOpen = (item: any) => {
        setSelectedItem(item);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedItem(null);
    };

    const columnsWithAction: GridColDef[] = [
        ...columnsDef,
        {
            field: "actions",
            headerName: "Detalles",
            sortable: false,
            filterable: false,
            align: "center",
            headerAlign: "center",
            width: 100,
            renderCell: (params) => (
                <IconButton
                    size="small"
                    onClick={() => handleOpen(params.row)}
                >
                    <SearchIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

    // helper: busca un string dentro de un objeto (profundidad DFS).
    function extractStringFromObject(obj: any): string | null {
        if (obj == null) return null;
        if (typeof obj === "string") return obj;

        // Prioridades de claves comunes
        const priorityKeys = ["nombre", "nombre_marca", "nombre_categoria", "name", "title", "label"];

        // Si es array, buscar dentro de sus elementos
        if (Array.isArray(obj)) {
            for (const el of obj) {
                const s = extractStringFromObject(el);
                if (s) return s;
            }
            return null;
        }

        // Buscar claves prioritarias en primer nivel
        for (const key of priorityKeys) {
            if (Object.prototype.hasOwnProperty.call(obj, key) && typeof obj[key] === "string") {
                return obj[key];
            }
        }

        // DFS: recorrer propiedades para encontrar cualquier string
        for (const key of Object.keys(obj)) {
            const val = obj[key];
            if (typeof val === "string") return val;
            if (typeof val === "object" && val !== null) {
                const s = extractStringFromObject(val);
                if (s) return s;
            }
        }

        return null;
    }

    const fetchData = async () => {
        try {
            const res = await fetch(apiUrl);
            if (res.status === 404) {
                setRows([]);
                return;
            }
            const data = await res.json();

            const key = Object.keys(data).find((k) => Array.isArray(data[k]));
            const items = key ? data[key] : Array.isArray(data) ? data : [];

            // Para cada item, reemplazamos las propiedades que sean objetos por su string encontrado
            const normalized = items.map((item: any, i: number) => {
                const copy = { ...item };

                for (const prop of Object.keys(copy)) {
                    const val = copy[prop];
                    // solo transformar objetos planos (no null, no arrays)
                    if (val && typeof val === "object" && !Array.isArray(val)) {
                        const found = extractStringFromObject(val);
                        if (found !== null) {
                            copy[prop] = found;
                        }
                    }
                }

                return {
                    id: item.id ?? i + 1,
                    ...copy,
                };
            });

            setRows(normalized);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchData();
    }, [apiUrl]);

    function handleUpdate() {
        setSelectedRows([]);
        fetchData();
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <div style={{ height: 600, width: "100%" }}>
                <DataGrid
                    rows={rows}
                    columns={columnsWithAction}
                    checkboxSelection
                    disableRowSelectionOnClick
                    disableColumnMenu
                    keepNonExistentRowsSelected
                    showToolbar={true}
                    slots={{
                        toolbar: () => (
                            <TableToolbar
                                rowsSelected={selectedRows}
                                handleUpdate={handleUpdate}
                                formulario={formulario}
                                title={title}
                                url={apiUrl}
                                deletionKey={deletionKey}
                            />
                        ),
                    }}
                    onRowSelectionModelChange={(r: any) => {
                        const selectedIDs = r.ids
                        const selectedRowData = rows.filter((row) => selectedIDs.has(row.id));
                        setSelectedRows(selectedRowData)
                    }}
                />

            </div>

            {/* --- Modal de Detalle / Edición --- */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Detalles</DialogTitle>
                <DialogContent>
                    {selectedItem && isValidElement(formulario)
                        ? cloneElement(formulario as React.ReactElement<{ item: any }>, { item: selectedItem })
                        : formulario}
                </DialogContent>
            </Dialog>
        </>
    );
}
