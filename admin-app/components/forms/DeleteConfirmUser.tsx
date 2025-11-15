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

// Definimos la estructura de lo que esperamos recibir
interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  // Esta función espera recibir el ID numérico del usuario borrado
  onDeleteSuccess: (deletedId: number) => void; 
  // Aceptamos que el usuario pueda tener la propiedad 'id' o 'id_usuario' para evitar errores
  userToDelete: { id?: number; id_usuario?: number; nombre?: string } | null;
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

    // --- CORRECCIÓN CRÍTICA AQUÍ ---
    // Verificamos qué propiedad tiene el ID correcto.
    // Prisma suele usar 'id_usuario' en tu base de datos, pero a veces el frontend espera 'id'.
    const userId = userToDelete.id_usuario || userToDelete.id;

    // Validación de seguridad: Si no hay ID, no hacemos la petición
    if (!userId) {
      console.error("Error: No se pudo encontrar el ID del usuario. Objeto recibido:", userToDelete);
      alert("Error: No se pudo identificar el usuario a eliminar.");
      return;
    }
    
    setLoading(true);
    try {
      // Hacemos la petición pasando el ID validado
      const response = await fetch(`/api/usuarios?id=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Avisamos al componente padre que se borró el usuario con este ID
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