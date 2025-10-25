import React from "react";
import Link from "next/link";

// --- Iconos para el Dashboard ---

// Icono para Boletas
const DocumentIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// Icono para Proveedores
const TruckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.86 12.73a1.5 1.5 0 00-1.21-.99L4.38 10.33a1.5 1.5 0 00-1.6 1.83l1.3 4.1A1.5 1.5 0 005.6 17h6.25a1.5 1.5 0 001.44-1.07l1.1-3.66a1.5 1.5 0 00-.53-1.54zM13.86 12.73L19.5 9m-5.64 3.73l5.64-3.73M19.5 9l-5.64 3.73m0 0V3.38A1.5 1.5 0 0115.4 2.1l4.1 1.3a1.5 1.5 0 01.99 1.21v8.82a1.5 1.5 0 01-1.5 1.5h-.44" />
  </svg>
);

// Icono para Clientes
const ClientIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0 .75.75 0 01-.466.825l-.234.085a1.875 1.875 0 01-1.01.214H6.717a1.875 1.875 0 01-1.01-.214l-.234-.085a.75.75 0 01-.466-.825z" />
  </svg>
);

// Icono para "Ver más"
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

// --- Componente principal ---

export default function Page() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
      {/* Contenido Principal */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Título de la Página */}
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
            Dashboard de Ventas
          </h2>

          {/* Grid de Tarjetas de Navegación */}
          {/* CLASE CLAVE: grid-cols-1 (móvil) md:grid-cols-2 (tablet) lg:grid-cols-3 (escritorio) */}
          {/* Se elimina 'max-w-4xl' para permitir que ocupe las 3 columnas en LG */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Tarjeta 1: Módulo de Boletas */}
            <Link href="/admin/boletas" className="block group">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
                <div className="bg-blue-100 p-3 rounded-full w-min">
                  <DocumentIcon className="w-7 h-7 text-blue-600" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Módulo de Boletas</h3>
                  <p className="mt-1 text-sm text-gray-600">Busca, visualiza y reimprime boletas o facturas pasadas.</p>
                </div>
                <div className="mt-auto pt-4 flex justify-end">
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Tarjeta 2: Gestión de Proveedores */}
            <Link href="/admin/proveedores" className="block group">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
                <div className="bg-blue-100 p-3 rounded-full w-min">
                  <TruckIcon className="w-7 h-7 text-blue-600" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Gestión de Proveedores</h3>
                  <p className="mt-1 text-sm text-gray-600">Administra, agrega o modifica la información de tus proveedores.</p>
                </div>
                <div className="mt-auto pt-4 flex justify-end">
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>

            {/* Tarjeta 3: Gestión de Clientes (NUEVA) */}
            <Link href="/ventas/clientes" className="block group">
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
                <div className="bg-blue-100 p-3 rounded-full w-min">
                  <ClientIcon className="w-7 h-7 text-blue-600" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Gestión de Clientes</h3>
                  <p className="mt-1 text-sm text-gray-600">Revisa, edita y gestiona la base de datos de clientes registrados.</p>
                </div>
                <div className="mt-auto pt-4 flex justify-end">
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </Link>

          </div>
        </div>
      </main>
    </div>
  );
}