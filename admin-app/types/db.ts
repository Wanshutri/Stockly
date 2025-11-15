export interface UsuarioType {
    id_usuario: number;
    nombre: string;
    email: string;
    password?: string;
    activo: boolean;
    id_tipo: number;
    created_at?: Date;
}