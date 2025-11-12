"use client";
import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DialogContentText from '@mui/material/DialogContentText';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface Props {
    open: boolean;
    onClose: () => void;
    onDeleteSuccess: (deletedId: number) => void; // Callback para avisar a la página principal
    userToDelete: { id: number; nombre: string } | null; // Recibimos el objeto usuario mínimo
}

export default function DeleteUserModal({ open, onClose, onDeleteSuccess, userToDelete }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!userToDelete) return null;

    const handleConfirmDelete = async () => {
        setLoading(true);
        setError('');
        try {
            // Asumiendo que tu API espera DELETE en /api/usuarios?id=...
            const response = await fetch(`/api/usuarios?id=${userToDelete.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error al eliminar usuario');

            if (data.success) {
                onDeleteSuccess(userToDelete.id); // Avisamos al padre que borre de la tabla
                onClose(); // Cerramos el modal
            }
        } catch (err: any) {
            setError(err.message || 'No se pudo eliminar el usuario.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle sx={{ color: '#dc2626', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                <DeleteIcon /> Eliminar Usuario
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: '#374151', mb: 2 }}>
                    ¿Seguro que deseas eliminar a <strong>{userToDelete.nombre}</strong>?
                    <br /><br />
                    <span className="text-sm text-red-600 bg-red-50 p-2 rounded block border border-red-100">
                        ⚠️ Esta acción es irreversible y el usuario perderá acceso inmediatamente.
                    </span>
                </DialogContentText>
                {error && <Alert severity="error">{error}</Alert>}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onClose} sx={{ color: 'gray' }} disabled={loading}>Cancelar</Button>
                <Button 
                    onClick={handleConfirmDelete} 
                    variant="contained" 
                    color="error" 
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}