'use client';

import { useEffect, useState } from 'react';
import InventoryIcon from '@mui/icons-material/Inventory';

type Producto = {
  sku: string;
  nombre: string;
  stock: number;
  // si después tu API expone umbral, úsalo:
  stockMin?: number;
  lowStock?: boolean;
};

export default function HomeStock() {
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/productos', { cache: 'no-store' });
        if (!res.ok) {
          // si tu backend manda 404 cuando no hay productos, lo tratamos como vacío
          if (res.status === 404) {
            if (!cancelled) setProductos([]);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) setProductos(data.productos ?? []);
      } catch (e) {
        console.error('Error al obtener /api/productos', e);
        if (!cancelled) setError('No se pudo obtener el stock');
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const isLoading = productos === null && !error;
  const total = productos?.length ?? 0;

  // Ajusta esta lógica si tu API trae umbral/bandera
  const necesitanRepo = (productos ?? []).filter(p =>
    typeof p.stockMin === 'number' ? p.stock <= (p.stockMin as number)
    : typeof p.lowStock === 'boolean' ? p.lowStock
    : p.stock <= 0
  ).length;

  return (
    <div className="shadow-md p-5 w-full rounded-xl bg-white hover:bg-gray-100 hover:shadow-lg transition-[background-color,box-shadow] duration-300">
      <div className="grid grid-cols-[30%_1fr] grid-rows-3 gap-0">

        {/* icono */}
        <div className="col-span-1 row-span-3 flex flex-col items-center justify-center p-4">
          <div className="bg-blue-200 p-3 rounded-full">
            <InventoryIcon fontSize="large" color="primary" />
          </div>
        </div>

        {/* título */}
        <div className="col-start-2 row-start-1">
          <h3 className="text-md font-semibold text-gray-500">Stock</h3>
        </div>

        {/* total */}
        <div className="col-start-2 row-start-2">
          <h4 className="text-2xl font-bold">
            {isLoading ? 'Cargando…' : error ? '—' : `${total} Productos`}
          </h4>
        </div>

        {/* reposición */}
        <div className="col-start-2 row-start-3">
          {isLoading ? (
            <p className="text-sm text-gray-500">Obteniendo datos…</p>
          ) : error ? (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          ) : (
            <p className={`text-sm font-medium ${necesitanRepo > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {necesitanRepo > 0 ? 'Requieren Reposicion' : 'Sin reposiciones pendientes'}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
