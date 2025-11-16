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

interface UsuarioType {
    id_usuario: number;
    nombre: string;
    email: string;
    password?: string;
    activo: boolean;
    id_tipo: number;
    created_at?: Date;
}

interface User {
    id: number;
    nombre: string;
    email: string;
    rol: 'Admin' | 'Vendedor' | 'Bodeguero';
    estado: 'Activo' | 'Inactivo';
}