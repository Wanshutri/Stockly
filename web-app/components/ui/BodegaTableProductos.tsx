import { useEffect, useState, cloneElement, isValidElement } from "react";
import { DataGrid, GridColDef, GridRowId, GridRowSelectionModel } from "@mui/x-data-grid";
import TableToolbar from "./TableToolBar";
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
    formulario: React.ReactElement<any>;
}

export default function ProductoTable({
    columnsDef,
    formulario
}: GenericTableProps) {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
        type: 'include',
        ids: new Set<GridRowId>(),
    });

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

    const fetchData = async () => {
        try {
            const res = await fetch("/api/productos");

            if (!res.ok) {
                throw new Error("Error al obtener productos");
            }

            const data: Producto[] = await res.json();

            const ps = data.map((p: Producto) => {
                return {
                    sku: p.sku,
                    nombre: p.nombre,
                    precio_compra: p.precio_compra,
                    gtin: p.gtin,
                    precio_venta: p.precio_venta,
                    stock: p.stock,
                    tipo_categoria: p.categoria.nombre_categoria,
                    marca: p.marca.nombre_marca
                };
            });

            setRows(ps);
        } catch (error) {
            console.error("Error cargando productos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // se ejecuta una vez al montar

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
                    getRowId={(row) => row.sku}
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
                                title={"Producto"}
                                url={"api/productos"}
                                deletionKey={"sku"}
                            />
                        ),
                    }}
                    onRowSelectionModelChange={(newSelectionModel: GridRowSelectionModel) => {
                        setRowSelectionModel(newSelectionModel);

                        // Extract the IDs from the new selection model
                        const selectedIDs = Array.from(newSelectionModel.ids || []);

                        // Filter your original 'rows' data to get the complete selected row objects
                        const selectedRows = rows.filter((row) => selectedIDs.includes(row.sku));

                        setSelectedRows(selectedRows)
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
