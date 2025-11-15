'use client';

import { useEffect, useState } from 'react';
import InventoryIcon from '@mui/icons-material/Inventory';
import { ProductoType } from '@/types/db';

export default function HomeStock() {
  const [productos, setProductos] = useState<ProductoType[] | null>(null);
  const [error, setError] = useState<string>('');
  const [lowStock, setLowStock] = useState<number>(0);

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

        const productos = data.productos;

        let c = 0

        productos.forEach((p: ProductoType) => {
          if (p.stock < 3) {
            c = + 1
          }
        });

        if (!cancelled) setProductos(data.productos ?? []);
        if (!cancelled) setLowStock(c ?? 0);
      } catch (e) {
        console.error('Error al obtener /api/productos', e);
        if (!cancelled) setError('No se pudo obtener el stock');
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const isLoading = productos === null && !error;
  const total = productos?.length ?? 0;

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
            {isLoading ? 'Cargando…' : error ? '—' :
              lowStock > 0
                ? `${lowStock} ${lowStock === 1 ? 'producto' : 'productos'}`
                : `${total} ${total === 1 ? 'producto' : 'productos'}`
            }
          </h4>
        </div>

        {/* reposición */}
        <div className="col-start-2 row-start-3">
          {(() => {
            const label = lowStock === 1 ? 'producto' : 'productos';
            const verb = lowStock === 1 ? 'requiere' : 'requieren';

            if (lowStock === 0) {
              return (
                <span className="text-green-800">
                  Mantienen buen stock
                </span>
              );
            }

            if (lowStock > 3) {
              return (
                <span className="text-red-500">
                  {verb} reposición
                </span>
              );
            }

            return (
              <span className="text-orange-500">
                {verb} reposición
              </span>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
