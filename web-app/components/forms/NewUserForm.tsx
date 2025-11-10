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
import { User } from '../../components/definitions/User';

interface Props {
    open: boolean;
    onClose: () => void;
    onCreate: (user: User) => void;
}

export default function CreateUserModal({ open, onClose, onCreate }: Props) {
    const initialFormState = { nombre: '', email: '', rol: 'Vendedor', estado: 'Activo', password: '' };
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

    // --- CONEXIÓN CON TU API (POST) ---
    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        // 1. Mapeo de roles de UI a IDs de tu DB (AJUSTA ESTOS NÚMEROS SEGÚN TU DB)
        const roleMap: { [key: string]: number } = { 'Admin': 1, 'Vendedor': 2, 'Bodeguero': 3 };

        try {
            const response = await fetch('/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    email: formData.email,
                    password: formData.password,
                    id_tipo: roleMap[formData.rol] || 2, // Default a Vendedor si falla
                    activo: true // Al crear siempre lo ponemos activo por defecto
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al crear usuario');
            }

            if (data.success) {
                // 2. Convertir la respuesta de la DB al formato de tu tabla UI
                // Tu API devuelve: { id_usuario, nombre, email, id_tipo, activo, ... }
                const newUserForTable: User = {
                    id: data.user.id_usuario,
                    nombre: data.user.nombre,
                    email: data.user.email,
                    rol: formData.rol as any, // Mantenemos el rol que seleccionó en UI
                    estado: 'Activo'
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
                        <TextField select label="Estado" name="estado" fullWidth value={formData.estado} onChange={handleChange} disabled={loading}>
                             <MenuItem value="Activo">Activo</MenuItem><MenuItem value="Inactivo">Inactivo</MenuItem>
                        </TextField>
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
                    color="success" 
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