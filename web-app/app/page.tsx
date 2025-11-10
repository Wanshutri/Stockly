'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import HomeStart from "@/components/ui/HomeStart";
import HomeAccess from "@/components/ui/HomeAccess"; // Asegúrate de que esta ruta sea correcta

// SI ESTOS ICONOS FALLAN, COMENTALOS Y USA TEXTO TEMPORALMENTE
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula carga
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <div className="w-full mt-[5rem] mb-10 px-5 md:px-0">
      <div className="md:w-[70%] mx-auto w-full">
        <HomeStart />

        {/* SECCIÓN 1: ACCIONES RÁPIDAS */}
        <div className="mt-8">
           <h2 className="text-xl font-bold mb-4 text-gray-700">Acciones Frecuentes</h2>
           <div className="flex flex-wrap gap-3">
              {/* Usamos botones HTML simples por ahora para probar */}
              <Link href="/ventas" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition">
                + Nueva Venta
              </Link>
              <Link href="/bodega" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition">
                + Agregar Producto
              </Link>
           </div>
        </div>

        {/* SECCIÓN 2: RESUMEN (SIMPLIFICADA) */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Resumen de hoy</h2>
          <div className="grid md:grid-cols-3 gap-4">
             {/* Tarjeta 1: Ventas */}
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Ventas de hoy</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                   {loading ? "..." : "$100.000"}
                </p>
                <span className="text-green-600 text-sm font-medium">+5.2% vs ayer</span>
             </div>

             {/* Tarjeta 2: Stock (Con alerta visual) */}
             <div className="bg-orange-50 p-6 rounded-xl border border-orange-200 shadow-sm">
                <h3 className="text-orange-800 text-sm font-medium uppercase">Stock Bajo</h3>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                   {loading ? "..." : "3 Productos"}
                </p>
                <Link href="/bodega" className="text-orange-700 text-sm font-medium underline mt-1 block">
                   Ver productos →
                </Link>
             </div>

             {/* Tarjeta 3: Clientes */}
             <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Clientes Nuevos</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                   {loading ? "..." : "15"}
                </p>
                <span className="text-indigo-600 text-sm font-medium">Este mes</span>
             </div>
          </div>
        </div>

        {/* SECCIÓN 3: TUS ACCESOS ORIGINALES */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Módulos</h2>
          <div className="grid lg:grid-cols-3 gap-5">
             {/* Si esto falla, es porque la ruta de importación está mal */}
             <HomeAccess icon={StoreIcon} titulo="Ventas" url="/ventas" descripcion="Ir al módulo de ventas" />
             <HomeAccess icon={InventoryIcon} titulo="Bodega" url="/bodega" descripcion="Ir al inventario" />
             <HomeAccess icon={AdminPanelSettingsIcon} titulo="Admin" url="/admin" descripcion="Ir a configuración" />
          </div>
        </div>

      </div>
    </div>
  );
}