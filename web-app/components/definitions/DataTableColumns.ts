import { GridColDef } from "@mui/x-data-grid";

export const productColumns: GridColDef[] = [
    { field: "sku", headerName: "SKU", flex: 1, minWidth: 100 },
    { field: "nombre", headerName: "Nombre", flex: 2, minWidth: 150 },
    { field: "gtin", headerName: "GTIN", flex: 1, minWidth: 120 },
    { field: "tipo_categoria", headerName: "Categoría", flex: 1, minWidth: 120 },
    { field: "marca", headerName: "Marca", flex: 1, minWidth: 120 },
    { field: "precio_compra", headerName: "Precio Compra", type: "number", flex: 1, minWidth: 120 },
    { field: "precio_venta", headerName: "Precio Venta", type: "number", flex: 1, minWidth: 120 },
    { field: "stock", headerName: "Stock", type: "number", flex: 1, minWidth: 80 },
];

export const marcaColumns: GridColDef[] = [
    { field: "id_marca", headerName: "ID de marca", flex: 1, minWidth: 120 },
    { field: "nombre_marca", headerName: "Nombre", flex: 2, minWidth: 150 },
];

export const categoriasColumns: GridColDef[] = [
    { field: "id_categoria", headerName: "ID de Categoria", flex: 1, minWidth: 120 },
    { field: "nombre_categoria", headerName: "Nombre Categoria", flex: 2, minWidth: 150 },
];