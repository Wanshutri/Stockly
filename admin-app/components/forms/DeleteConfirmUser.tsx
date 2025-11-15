"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button,
  CircularProgress 
} from '@mui/material';

// 1. Interfaz actualizada para usar camelCase (idUsuario)
interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  onDeleteSuccess: (deletedId: number) => void; 
  // Aceptamos varias formas de id para ser tolerantes con distintos mapeos
  userToDelete: { id?: number; idUsuario?: number; id_usuario?: number; nombre: string; } | null;
}

export default function DeleteUserModal({ 
  open, 
  onClose, 
  onDeleteSuccess, 
  userToDelete 
}: DeleteUserModalProps) {

  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!userToDelete) return;

    // --- Detectar el ID pase por distintas claves (id, idUsuario, id_usuario) ---
    const userId = (userToDelete as any)?.idUsuario ?? (userToDelete as any)?.id ?? (userToDelete as any)?.id_usuario;

    if (userId === undefined || userId === null) {
      console.error("Error: No se pudo encontrar el ID del usuario. Objeto recibido:", userToDelete);
      alert("Error: No se pudo identificar el usuario a eliminar.");
      return;
    }
    
    setLoading(true);
    try {
      // Tu API espera el ID en el query param 'id'
      const response = await fetch(`/api/usuarios?id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDeleteSuccess(userId); 
        onClose();
      } else {
        const errorData = await response.json();
        console.error("Error al eliminar:", errorData);
        alert("Hubo un error al intentar eliminar el usuario.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
        ¿Eliminar usuario?
      </DialogTitle>
      
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Estás a punto de eliminar al usuario <strong>{userToDelete?.nombre || "Seleccionado"}</strong>.
          <br /><br />
          Esta acción es permanente y no se puede deshacer. ¿Estás seguro de que deseas continuar?
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ padding: 3 }}>
        <Button 
          onClick={onClose} 
          color="inherit" 
          disabled={loading}
          sx={{ color: 'text.secondary' }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleDelete} 
          color="error" 
          variant="contained" 
          disabled={loading}
          autoFocus
          sx={{ boxShadow: 'none' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Eliminar Usuario"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}