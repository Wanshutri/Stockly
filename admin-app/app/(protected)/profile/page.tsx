"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import EditProfileModal from "../../../components/forms/ProfileForm";
import ChangePasswordModal from "../../../components/forms/PasswordForm";

type FetchedUser = {
  id_usuario: number;
  nombre: string;
  email: string;
  activo: boolean;
  id_tipo: number;
};

const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21.75a8.966 8.966 0 01-5.982-2.975M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>);
const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>);

const ProfileSkeleton = () => (
  <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-4 xl:col-span-3 bg-gray-50 p-8 flex flex-col items-center"><div className="w-32 h-32 rounded-full bg-gray-200 mb-6"></div><div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div><div className="h-5 bg-gray-200 rounded w-1/2"></div></div>
      <div className="lg:col-span-8 xl:col-span-9 p-8 space-y-8"><div className="h-7 bg-gray-200 rounded w-1/4 mb-6"></div><div className="space-y-6"><div className="h-5 bg-gray-200 rounded w-full"></div><div className="h-5 bg-gray-200 rounded w-full"></div></div></div>
    </div>
  </div>
);

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<FetchedUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Estados para los modales
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // 2. NUEVO ESTADO

  useEffect(() => {
    async function load() {
      const userId = (session?.user as any)?.id;
      if (!userId) return;
      setLoadingUser(true);
      try {
        const res = await fetch(`/api/usuarios?id=${encodeURIComponent(userId)}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setUser(data.user ?? null);
      } catch (err) { console.error(err); setUser(null); }
      finally { setLoadingUser(false); }
    }
    if (status === "authenticated") load();
  }, [session, status]);

  const handleProfileUpdate = (updatedUser: FetchedUser) => { setUser(updatedUser); };
  const getRoleName = (roleId: number) => { switch (roleId) { case 1: return "Administrador"; case 2: return "Vendedor"; case 3: return "Bodeguero"; default: return `Rol #${roleId}`; } }

  if (status === "loading" || loadingUser) return <main className="flex-grow p-4 sm:p-6 lg:p-10"><div className="max-w-6xl mx-auto"><h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Mi Perfil</h2><ProfileSkeleton /></div></main>;
  if (status === "unauthenticated") return <main className="flex-grow p-4 sm:p-6 lg:p-10 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold text-gray-900">Acceso Denegado</h2><Link href="/auth/login" className="mt-4 inline-block text-blue-600 hover:underline">Ir al Login</Link></div></main>;
  if (!user) return <main className="flex-grow p-4 sm:p-6 lg:p-10"><div className="max-w-6xl mx-auto"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">Error al cargar perfil.</div></div></main>;

  return (
    <main className="flex-grow p-4 sm:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl mt-32 border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">

            {/* Columna Izquierda */}
            <div className="lg:col-span-4 xl:col-span-3 bg-gray-50 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col items-center text-center justify-center">
              <div className="relative w-36 h-36 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-gray-200 mb-6 border-[6px] border-white shadow-sm">
                <UserCircleIcon className="w-full h-full text-gray-400 p-2" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{user.nombre}</h3>
              <p className="text-md font-medium text-blue-600 mt-1">{getRoleName(user.id_tipo)}</p>
              <div className={`mt-5 px-4 py-1.5 rounded-full text-sm font-semibold ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.activo ? 'Cuenta Activa' : 'Cuenta Inactiva'}
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="lg:col-span-8 xl:col-span-9 p-8 lg:p-12 space-y-10 flex flex-col justify-center">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-100">Información de la Cuenta</h4>
                <dl className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <dt className="text-sm font-medium text-gray-500">ID de Usuario</dt>
                    <dd className="text-base text-gray-900 sm:col-span-2 font-mono bg-gray-100 px-3 py-1.5 rounded-md w-fit">#{user.id_usuario}</dd>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-baseline">
                    <dt className="text-sm font-medium text-gray-500">Correo Electrónico</dt>
                    <dd className="text-lg text-gray-900 sm:col-span-2 font-medium">{user.email}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-100">Seguridad y Ajustes</h4>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center justify-center gap-2 py-3 px-6 bg-white text-gray-700 font-semibold rounded-xl shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 text-base"
                  >
                    <PencilIcon className="w-5 h-5 text-gray-500" />
                    Editar Datos
                  </button>

                  {/* 3. BOTÓN DE CAMBIAR CONTRASEÑA CONECTADO */}
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="flex items-center justify-center gap-2 py-3 px-6 bg-white text-gray-700 font-semibold rounded-xl shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 text-base"
                  >
                    <KeyIcon className="w-5 h-5 text-gray-500" />
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- RENDERIZADO DE MODALES --- */}
      {user && (
        <>
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            user={user}
            onUpdate={handleProfileUpdate}
          />
          {/* 4. NUEVO MODAL RENDERIZADO */}
          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            userId={user.id_usuario}
          />
        </>
      )}
    </main>
  );
}