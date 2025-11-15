"use client";
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogContentText from '@mui/material/DialogContentText';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// Asumimos que la definición de User (para la UI/tabla) es algo así:
// Esta NO es la 'UsuarioType' de la base de datos.
export interface User {
    id: number;
    nombre: string;
    email: string;
    rol: 'Admin' | 'Vendedor' | 'Bodeguero';
    estado: 'Activo' | 'Inactivo';
}

interface Props {
    open: boolean;
    onClose: () => void;
    onCreate: (user: User) => void;
}

export default function CreateUserModal({ open, onClose, onCreate }: Props) {
    // 1. Estado inicial actualizado (sin 'estado')
    const initialFormState = { nombre: '', email: '', rol: 'Vendedor', password: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        setFormData(initialFormState);
        setError('');
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        // Mapeo de roles de UI a IDs de tu DB
        const roleMap: { [key: string]: number } = { 'Admin': 1, 'Vendedor': 2, 'Bodeguero': 3 };

        try {
            const response = await fetch('/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    email: formData.email,
                    password: formData.password,
                    // 2. CORRECCIÓN: 'idTipo' (camelCase) para coincidir con la API
                    idTipo: roleMap[formData.rol] || 2,
                    activo: true // La API siempre lo crea como 'activo'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear usuario');
            }

            if (data.success) {
                // 3. CORRECCIÓN: 'idUsuario' (camelCase) para coincidir con la API
                const newUserForTable: User = {
                    id: data.user.idUsuario,
                    nombre: data.user.nombre,
                    email: data.user.email,
                    rol: formData.rol as any,
                    estado: 'Activo' // Lo definimos como Activo en la UI
                };
                onCreate(newUserForTable);
                handleClose();
            }

        } catch (err: any) {
            setError(err.message || 'Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : handleClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', pb: 1, color: '#2563eb' }}>Nuevo Usuario</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 3 }}>Ingrese los datos para registrar un nuevo miembro en el sistema.</DialogContentText>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <div className="flex flex-col gap-4">
                    <TextField autoFocus label="Nombre Completo" name="nombre" fullWidth value={formData.nombre} onChange={handleChange} disabled={loading} />
                    <TextField label="Email" name="email" type="email" fullWidth value={formData.email} onChange={handleChange} disabled={loading} />
                    <div className="flex gap-4">
                        <TextField select label="Rol" name="rol" fullWidth value={formData.rol} onChange={handleChange} disabled={loading}>
                            {['Admin', 'Vendedor', 'Bodeguero'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </TextField>
                        {/* 4. CAMPO "ESTADO" ELIMINADO */}
                    </div>
                    <TextField
                        label="Contraseña"
                        name="password"
                        type="password"
                        fullWidth
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        helperText="Mínimo 6 caracteres"
                    />
                </div>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleClose} sx={{ color: 'gray' }} disabled={loading}>Cancelar</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary" // 5. CAMBIO: De 'success' a 'primary' (azul)
                    disabled={loading || !formData.password || formData.password.length < 6}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ fontWeight: 'bold', px: 4 }}
                >
                    {loading ? 'Guardando...' : 'Crear Usuario'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}