import Link from 'next/link';
import HomeStart from "@/components/ui/HomeStart";
import HomeAccess from "@/components/ui/HomeAccess"; // Asegúrate de que esta ruta sea correcta

// SI ESTOS ICONOS FALLAN, COMENTALOS Y USA TEXTO TEMPORALMENTE
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import HomeVentas from '@/components/ui/HomeVentas';
import HomeStock from '@/components/ui/HomeStock';

export default function Home() {

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
            <div className="mt-10 mx-auto">
               <h2 className="text-2xl font-bold mt-4 mb-4">Resumen de hoy</h2>
               <div className="grid md:grid-cols-2 gap-4">
                  {/* Tarjeta 1: Ventas */}
                  <HomeVentas></HomeVentas>
                  {/* Tarjeta 2: Stock (Con alerta visual) */}
                  <HomeStock></HomeStock>
               </div>
            </div>

            {/* SECCIÓN 3: TUS ACCESOS ORIGINALES */}
            <div className="mt-12">
               <h2 className="text-2xl font-bold mb-4">Módulos</h2>
               <div className="grid lg:grid-cols-2 gap-5">
                  {/* Si esto falla, es porque la ruta de importación está mal */}
                  <HomeAccess icon={StoreIcon} titulo="Ventas" url="/ventas" descripcion="Ir al módulo de ventas" />
                  <HomeAccess icon={InventoryIcon} titulo="Bodega" url="/bodega" descripcion="Ir al inventario" />
               </div>
            </div>

         </div>
      </div>
   );
}