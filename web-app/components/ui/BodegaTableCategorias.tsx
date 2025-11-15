import { useEffect, useState, cloneElement } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
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

export default function CategoriaTable({
    columnsDef,
    formulario
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

    const fetchData = async () => {
        try {
            const res = await fetch("/api/categorias");

            if (!res.ok) {
                throw new Error("Error al obtener categorías");
            }

            const data: Categoria[] = await res.json();

            const cs = data.map((c: Categoria) => ({
                id_categoria: c.id_categoria,
                nombre_categoria: c.nombre_categoria
            }));

            setRows(cs);
        } catch (error) {
            console.error("Error cargando categorías:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = () => {
        setSelectedRows([]);
        fetchData();
    };

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
                    getRowId={(row) => row.id_categoria}
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
                                title={"Categoría"}
                                url={"api/categorias"}
                                deletionKey={"id_categoria"}
                            />
                        ),
                    }}
                    onRowSelectionModelChange={(newSelectionModel: GridRowSelectionModel) => {
                        const selectedIDs = Array.from(newSelectionModel.ids || []);
                        const selectedRows = rows.filter((row) => selectedIDs.includes(row.id_categoria));
                        setSelectedRows(selectedRows);
                    }}
                />
            </div>

            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Detalles</DialogTitle>
                <DialogContent>
                    {cloneElement(formulario as React.ReactElement<{ item: Categoria; onSuccess?: () => void }>, {
                        item: selectedItem,
                        onSuccess: () => {
                            handleUpdate();
                            handleClose();
                        }
                    })}
                </DialogContent>
            </Dialog>
        </>
    );
}
