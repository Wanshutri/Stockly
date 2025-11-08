import { GridColDef } from "@mui/x-data-grid";

// Columnas del DataGrid
export const productColumns: GridColDef[] = [
    { field: "sku", headerName: "SKU", width: 120 },
    { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 150 },
    { field: "tipo_categoria", headerName: "Categoría", width: 150 },
    { field: "marca", headerName: "Marca", width: 150 },
    { field: "precio_compra", headerName: "Precio Compra", type: "number", width: 130 },
    { field: "precio_venta", headerName: "Precio Venta", type: "number", width: 130 },
    { field: "stock", headerName: "Stock", type: "number", width: 100 },
    { field: "descripcion", headerName: "Descripción", flex: 1, minWidth: 200 },
];