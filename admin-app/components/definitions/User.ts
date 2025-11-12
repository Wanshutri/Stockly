export interface User {
    id: number;
    nombre: string;
    email: string;
    rol: 'Admin' | 'Vendedor' | 'Bodeguero';
    estado: 'Activo' | 'Inactivo';
}