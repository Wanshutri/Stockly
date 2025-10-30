"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StocklyNavbar from "./components/StocklyNavBar/StocklyNavbar";
import StocklyFooter from "./components/StocklyFooter/StocklyFooter";

// --- Iconos (Los mismos de antes) ---
const DollarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0l.879-.659M12 21a9 9 0 110-18 9 9 0 010 18z" />
  </svg>
);
const ArchiveBoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);
const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-12 0m12 0a9.094 9.094 0 00-12 0m12 0A9.094 9.094 0 0012 21.69a9.094 9.094 0 00-6-2.97m12 0c-3.18.9-6.81.9-10 0" />
  </svg>
);
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m3-3.75l-3 3m0 0l-3-3m3 3V15m6-1.5h.008v.008H18V15m-1.255 3.75l-3 3m0 0l-3-3m3 3V18.75" />
  </svg>
);
const CogIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5" />
  </svg>
);
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

// --- Componente Skeleton para KPIs ---
const KpiCardSkeleton = () => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-5">
    <div className="bg-gray-200 p-3 rounded-full animate-pulse">
      <div className="w-7 h-7 bg-gray-300 rounded-full"></div>
    </div>
    <div className="flex-grow">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
      <div className="h-7 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
    </div>
  </div>
);


export default function Page() {
  // Simulación de carga de datos
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula una llamada a API
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // Carga después de 1.5 segundos
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <header>
        <StocklyNavbar />
      </header>
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-12">

          {/* --- Sección 1: Bienvenida y CTA --- */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Bienvenido, Ignacio
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                Aquí tienes un resumen de la actividad de tu negocio.
              </p>
            </div>
            <div>
              <Link
                href="/ventas/pago"
                className="flex items-center gap-2 py-2 px-4
                         bg-blue-600 text-white font-semibold rounded-lg shadow-sm
                         hover:bg-blue-700 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <PlusIcon className="w-5 h-5" />
                Nueva Venta
              </Link>
            </div>
          </div>

          {/* --- Sección 2: Estadísticas Rápidas (KPIs) --- */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">
              Resumen de Hoy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Estado de Carga (Skeletons) */}
              {isLoading ? (
                <>
                  <KpiCardSkeleton />
                  <KpiCardSkeleton />
                  <KpiCardSkeleton />
                </>
              ) : (
                /* Datos Cargados */
                <>
                  {/* KPI Card 1 */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-5
                                transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:border-blue-200">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <DollarIcon className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Ventas de Hoy</p>
                      <p className="text-2xl font-semibold text-gray-900">$1.250.000</p>
                      <p className="text-xs text-green-600">+5.2% vs ayer</p>
                    </div>
                  </div>

                  {/* KPI Card 2 */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-5
                                transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:border-blue-200">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <ArchiveBoxIcon className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Stock Bajo</p>
                      <p className="text-2xl font-semibold text-gray-900">8 Productos</p>
                      <p className="text-xs text-red-600">Requieren reposición</p>
                    </div>
                  </div>

                  {/* KPI Card 3 */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-5
                                transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:border-blue-200">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <UserGroupIcon className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Clientes Nuevos (Mes)</p>
                      <p className="text-2xl font-semibold text-gray-900">42</p>
                      <p className="text-xs text-gray-500">Actividad reciente</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* --- Sección 3: Acceso Rápido (Navegación) --- */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">
              Acceso Rápido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Nav Card 1: Ventas */}
              <Link href="/ventas" className="block group">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100
                              transition-all duration-300 transform hover:-translate-y-1
                              hover:shadow-xl hover:border-blue-200
                              h-full flex flex-col">
                  <div className="bg-blue-100 p-3 rounded-full w-min">
                    <CreditCardIcon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Módulo de Ventas
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Accede a boletas, pagos y reportes de ventas.
                    </p>
                  </div>
                  <div className="mt-auto pt-4 flex justify-end">
                    <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </Link>

              {/* Nav Card 2: Bodega */}
              <Link href="/bodega" className="block group">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100
                              transition-all duration-300 transform hover:-translate-y-1
                              hover:shadow-xl hover:border-blue-200
                              h-full flex flex-col">
                  <div className="bg-blue-100 p-3 rounded-full w-min">
                    <ArchiveBoxIcon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Módulo de Bodega
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Gestiona inventario, productos y proveedores.
                    </p>
                  </div>
                  <div className="mt-auto pt-4 flex justify-end">
                    <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </Link>

              {/* Nav Card 3: Administración */}
              <Link href="/admin" className="block group">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100
                              transition-all duration-300 transform hover:-translate-y-1
                              hover:shadow-xl hover:border-blue-200
                              h-full flex flex-col">
                  <div className="bg-blue-100 p-3 rounded-full w-min">
                    <CogIcon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Administración
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Configura usuarios, permisos y ajustes del sistema.
                    </p>
                  </div>
                  <div className="mt-auto pt-4 flex justify-end">
                    <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </Link>

            </div>
          </div>

        </div>
      </main>
      <footer className="absolute bottom-0 left-0 right-0 text-white p-4">
        <StocklyFooter />
      </footer>
    </div>
  );
}