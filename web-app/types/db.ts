interface Categoria {
    id_categoria: number;
    nombre_categoria: string;
}

interface Marca {
    id_marca: number;
    nombre_marca: string;
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

interface DetalleCompra {
    id_compra: number;
    sku_producto: string;
    cantidad: number;
    subtotal: string;
    nombre_producto: string;
    gtin_producto: string | null;
    precio_unitario: string;
    marca_producto: string;
    categoria_producto: string;
}

interface Compra {
    id_compra: number;
    fecha: string;
    total: string;
    monto_efectivo: number;
    monto_tarjeta: number;
}

interface UsuarioType {
    id_usuario: number;
    nombre: string;
    email: string;
    password?: string;
    activo: boolean;
    id_tipo: number;
    created_at?: Date;
}