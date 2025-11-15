"use client";
import { useState, useEffect } from 'react';
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
    userToEdit: User | null;
    onUpdate: (user: User) => void;
}

export default function EditUserModal({ open, onClose, userToEdit, onUpdate }: Props) {
    const [formData, setFormData] = useState<User & { password?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userToEdit) {
            setFormData({ ...userToEdit, password: '' }); // Password inicia vacía
            setError('');
        }
    }, [userToEdit]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- CONEXIÓN CON LA API (PATCH) ---
    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        const roleMap: { [key: string]: number } = { 'Admin': 1, 'Vendedor': 2, 'Bodeguero': 3 };

        const payload: any = {
            nombre: formData.nombre,
            // --- ¡CORRECCIÓN AQUÍ! ---
            // Tu API espera 'idTipo' (camelCase)
            idTipo: roleMap[formData.rol as string] || 2,
            activo: formData.estado === 'Activo'
        };

        if (formData.password && formData.password.trim() !== '') {
            // Validamos la contraseña nueva
            if (formData.password.trim().length < 6) {
                setError('La nueva contraseña debe tener al menos 6 caracteres.');
                setLoading(false);
                return;
            }
            payload.password = formData.password;
        }

        try {
            const response = await fetch(`/api/usuarios?id=${userToEdit?.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error al actualizar');

            if (data.success) {
                const { password, ...userForTable } = formData;
                onUpdate(userForTable as User);
                onClose(); // Cierra el modal en éxito
            }

        } catch (err: any) {
            console.error("Error en handleSubmit:", err);
            setError(err.message || 'No se pudieron guardar los cambios.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', pb: 1, color: '#2563eb' }}>Editar Usuario</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 3 }}>Modifique la información del usuario. Deje la contraseña en blanco para mantener la actual.</DialogContentText>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <div className="flex flex-col gap-4">
                    <TextField label="Nombre Completo" name="nombre" fullWidth value={formData.nombre} onChange={handleChange} disabled={loading} />
                    <TextField label="Email" fullWidth value={formData.email} disabled sx={{ bgcolor: '#f9fafb' }} helperText="El email no se puede cambiar." />
                    <div className="flex gap-4">
                        <TextField select label="Rol" name="rol" fullWidth value={formData.rol} onChange={handleChange} disabled={loading}>
                            {['Admin', 'Vendedor', 'Bodeguero'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                        </TextField>
                        <TextField select label="Estado" name="estado" fullWidth value={formData.estado} onChange={handleChange} disabled={loading}>
                            <MenuItem value="Activo">Activo</MenuItem><MenuItem value="Inactivo">Inactivo</MenuItem>
                        </TextField>
                    </div>
                    <TextField
                        label="Nueva Contraseña (Opcional)"
                        name="password"
                        type="password"
                        fullWidth
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="Dejar en blanco para no cambiar"
                        helperText="Mínimo 6 caracteres si se modifica" // Helper text actualizado
                    />
                </div>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} sx={{ color: 'gray' }} disabled={loading}>Cancelar</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ fontWeight: 'bold', px: 4 }}
                >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}