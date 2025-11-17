import Link from "next/link";

import StorefrontIcon from '@mui/icons-material/Storefront';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TotalUsersCard from '../components/ui/TotalUsersCard';
import ActiveUsersCard from '../components/ui/ActiveUsersCard';
import RolesCard from '../components/ui/RolesCard';
import SaludoHeader from "@/components/ui/SaludoHeader";

export default async function Page() {

   async function fetchUsuarios() {
      const usuariosRes = await fetch(`${process.env.NEXTAUTH_URL}/api/usuarios`, { cache: "no-store" });
      if (!usuariosRes.ok) throw new Error(`Error al cargar /api/usuarios`);

      // La respuesta completa
      const json = await usuariosRes.json();

      // Accedemos al array real dentro de json.users
      const usuarios: UsuarioType[] = json.users;

      // Filtrar solo los usuarios activos
      const activos = usuarios.filter(u => u.activo === true);

      // Total de usuarios
      const total = usuarios.length;

      return { usuarios, activos, total };
   }

   const { usuarios, activos, total } = await fetchUsuarios();


   return (
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
         <div className="max-w-7xl mt-20 mx-auto space-y-12">
            {/* --- Sección 1: Bienvenida y Acción Rápida --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-16">
               <div>
                  <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                     Panel de Administración
                  </h2>
                  <SaludoHeader></SaludoHeader>
               </div>
            </div>

            {/* --- Sección 2: Tarjetas informativas --- */}
            <div className="bg-gradient-to-r from-white/60 to-blue-50/40 p-2 rounded-xl">
               <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Resumen del Sistema</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  <TotalUsersCard count={total} />
                  <ActiveUsersCard count={activos.length} />
                  <RolesCard count={3} />

               </div>
            </div>

            {/* --- Sección 3: Módulos Principales --- */}
            <div>
               <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Acceso Rápido</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Tarjeta 1: Gestionar Usuarios */}
                  <Link
                     href="/users"
                     className="block group"
                  >
                     <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100
                                    transition-all duration-300 transform 
                                    hover:-translate-y-1 hover:shadow-xl hover:border-blue-200
                                    h-full flex flex-col min-h-[280px]">

                        <div className="bg-blue-100 p-3 rounded-full w-min mb-5">
                           <AdminPanelSettingsIcon className="w-9 h-9 text-blue-600" />
                        </div>

                        <h3 className="text-2xl font-semibold text-gray-900">
                           Gestión de Usuarios
                        </h3>
                        <p className="mt-2 text-base text-gray-600">
                           Añadir, editar o desactivar las cuentas de usuario del sistema.
                        </p>

                        <div className="mt-auto pt-6 flex justify-end">
                           <ArrowForwardIcon className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                     </div>
                  </Link>

                  {/* Tarjeta 2: Ir a la App Principal */}
                  <Link
                     href="http://localhost:80/"
                     target="_blank"
                     rel="noopener noreferrer"
                     className="block group"
                  >
                     <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100
                                    transition-all duration-300 transform 
                                    hover:-translate-y-1 hover:shadow-xl hover:border-blue-200
                                    h-full flex flex-col min-h-[280px]">

                        <div className="bg-blue-100 p-3 rounded-full w-min mb-5">
                           <StorefrontIcon className="w-9 h-9 text-blue-600" />
                        </div>

                        <h3 className="text-2xl font-semibold text-gray-900">
                           Ir a la App Principal
                        </h3>
                        <p className="mt-2 text-base text-gray-600">
                           Acceder a los módulos de Ventas y Bodega de Stockly (Abre en una nueva pestaña).
                        </p>

                        <div className="mt-auto pt-6 flex justify-end">
                           <ArrowForwardIcon className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                        </div>
                     </div>
                  </Link>
               </div>
            </div>
         </div>
      </main>
   );
}