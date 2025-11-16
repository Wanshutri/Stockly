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