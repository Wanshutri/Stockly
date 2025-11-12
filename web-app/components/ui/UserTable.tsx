"use client"

import { useState, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import NewUserModal from '../../../web-app/components/forms/NewUserForm';
import EditUserModal from '../../../web-app/components/forms/EditUserForm';
import DeleteUserModal from '../../../web-app/components/ui/DeleteUser';
import { User } from '../../../web-app/components/definitions/User'
import useUser from '../hooks/useUser';

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // Estado para errores de carga
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const { user } = useUser();

    // --- FUNCIÓN PARA CARGAR USUARIOS DESDE LA API ---
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/usuarios');
            if (!response.ok) throw new Error('Error al cargar usuarios');
            const data = await response.json();

            // Mapeo de roles (ID -> Nombre)
            const roleMapReverse: { [key: number]: string } = { 1: 'Admin', 2: 'Vendedor', 3: 'Bodeguero' };

            // Transformar datos de la API al formato de nuestra tabla UI
            const mappedUsers: User[] = data.users.map((u: any) => ({
                id: u.id_usuario,
                nombre: u.nombre,
                email: u.email,
                rol: roleMapReverse[u.id_tipo] || 'Vendedor',
                estado: u.activo ? 'Activo' : 'Inactivo'
            }));

            setUsers(mappedUsers);
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar los usuarios. Por favor, recargue la página.');
        } finally {
            setLoading(false);
        }
    };

    // Cargar usuarios al montar el componente //
    useEffect(() => {
        fetchUsers();
    }, []);

    // --- HANDLERS CRUD LOCALES --- //

    const handleCreate = (newUser: User) => {
        setUsers([...users, newUser]);
        setIsCreateOpen(false);
    };

    const handleUpdate = (updatedUser: User) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setEditingUser(null);
        if (updatedUser.id === user?.id_usuario) {
            window.location.reload();
        }
    };

    const handleDeleteSuccess = (deletedId: number) => {
        setUsers(users.filter(u => u.id !== deletedId));
        setDeletingUser(null);
    };

    return (
        <div className="w-full mt-[5rem] mb-20 px-5 md:px-0">
            <div className="md:w-[80%] mt-26 mx-auto w-full">
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
                            <p className="text-gray-500 mt-1">Administra los accesos y permisos del personal.</p>
                        </div>
                        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setIsCreateOpen(true)} sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' }, textTransform: 'none', fontWeight: 'bold', py: 1.5, px: 3, borderRadius: 2 }}>
                            Nuevo Usuario
                        </Button>
                    </div>
                </div>

                {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (<div className="p-10 text-center text-gray-500">Cargando usuarios...</div>) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-sm">
                                                            {user.nombre.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-semibold text-gray-900">{user.nombre}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap"><Chip label={user.rol} size="small" sx={{ fontWeight: 500, bgcolor: '#f3f4f6', color: '#374151' }} /></td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.estado === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${user.estado === 'Activo' ? 'bg-green-600' : 'bg-red-600'}`}></span>{user.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Tooltip title="Editar"><IconButton onClick={() => setEditingUser(user)} color="primary" size="small" sx={{ mr: 1, bgcolor: '#eff6ff' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Eliminar"><IconButton onClick={() => setDeletingUser(user)} color="error" size="small" sx={{ bgcolor: '#fef2f2' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                                No hay usuarios registrados aún.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <NewUserModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={handleCreate} />
            <EditUserModal open={!!editingUser} onClose={() => setEditingUser(null)} userToEdit={editingUser} onUpdate={handleUpdate} />
            <DeleteUserModal open={!!deletingUser} onClose={() => setDeletingUser(null)} onDeleteSuccess={handleDeleteSuccess} userToDelete={deletingUser}
            />
        </div>
    );
}