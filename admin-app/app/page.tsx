"use client";

import React from "react";
import Link from "next/link";
import useUser from "../components/hooks/useUser";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';

// Icono para "Ir a" (ArrowRightIcon)
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.0} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
   </svg>
);

export default function Page() {
   const { user } = useUser();

   return (
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
         <div className="max-w-7xl mx-auto space-y-8">
            <div>
               <h2 className="text-3xl font-bold mt-20 tracking-tight text-gray-900">
                  Panel de Administración
               </h2>
               <p className="mt-2 text-lg text-gray-600">
                  {user ? `Bienvenido de vuelta, ${user.nombre}.` : "Bienvenido."}
               </p>
            </div>

            <div className="bg-gradient-to-br from-gray-700 to-blue-500 rounded-2xl shadow-xl 
                        p-12 lg:p-20 flex flex-col items-center justify-center text-center
                        min-h-[calc(100vh-300px)]">

               <div className="bg-white/10 p-4 rounded-full backdrop-blur-sm border-2 border-white/20">
                  <PersonOutlineIcon sx={{
                     fontSize: '6rem',
                     color: 'white'    
                  }} />
               </div>

               <h3 className="mt-8 text-4xl font-extrabold text-white tracking-tight">
                  Gestión de Usuarios
               </h3>
               <p className="mt-4 text-lg text-blue-100 max-w-lg">
                  Añadir, editar o desactivar las cuentas de usuario del sistema. Esta es la sección principal de este panel.
               </p>

               <Link
                  href="/users"
                  className="mt-10 inline-flex items-center gap-2 py-3 px-8
                  bg-gradient-to-r from-pink-500 to-rose-400 text-white 
                  font-semibold text-base
                  rounded-2xl shadow-lg
                  transition-all duration-300 transform 
                  hover:from-white-100 hover:to-white-500 
                  hover:-translate-y-1 hover:shadow-2xl hover:scale-105 
                  focus:ring-4 focus:ring-pink-300 focus:outline-none"
               >
                  Acceder al Módulo
                  <ArrowRightIcon className="w-5 h-5" />
               </Link>

            </div>
         </div>
      </main>
   );
}