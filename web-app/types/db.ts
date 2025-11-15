interface Categoria {
    id_categoria : number;
    nombre_categoria : string;
}

interface Marca {
    id_marca : number;
    nombre_marca : string;
}

interface Producto {
    sku: string,
    nombre: string,
    gtin?: string,
    precio_venta: number,
    precio_compra: number,
    stock: number
    categoria: Categoria,
    marca: Marca
}