import { useEffect, useState, cloneElement } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid";
import TableToolbar from "../TableToolBar";
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

export default function MarcaTable({
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
            const res = await fetch("/api/marcas");

            if (!res.ok) {
                throw new Error("Error al obtener marcas");
            }

            const data: Marca[] = await res.json();

            const ms = data.map((m: Marca) => {
                return {
                    id_marca : m.id_marca,
                    nombre_marca : m.nombre_marca
                };
            });

            setRows(ms);
        } catch (error) {
            console.error("Error cargando marcas:", error);
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
                    getRowId={(row) => row.id_marca}
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
                                title={"Marca"}
                                url={"api/marcas"}
                                deletionKey={"id_marca"}
                            />
                        ),
                    }}
                    onRowSelectionModelChange={(newSelectionModel: GridRowSelectionModel) => {

                        // Extract the IDs from the new selection model
                        const selectedIDs = Array.from(newSelectionModel.ids || []);

                        // Filter your original 'rows' data to get the complete selected row objects
                        console.log(selectedIDs)
                        const selectedRows = rows.filter((row) => selectedIDs.includes(row.id_marca));

                        setSelectedRows(selectedRows)
                    }}
                />
            </div>

            {/* --- Modal de Detalle / Edición --- */}
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                <DialogTitle>Detalles</DialogTitle>
                <DialogContent>
                    {cloneElement(formulario as React.ReactElement<{ item: Marca; onSuccess?: () => void }>, {
                        item: selectedItem, // si es undefined, no pasa nada
                        onSuccess: () => {
                            handleUpdate(); // refresca tabla
                            handleClose();  // cierra modal
                        }
                    })}
                </DialogContent>
            </Dialog>
        </>
    );
}
