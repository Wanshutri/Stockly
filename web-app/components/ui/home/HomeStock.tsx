"use client";

import { useEffect, useState } from "react";
import InventoryIcon from "@mui/icons-material/Inventory";

export default function HomeStock() {
  const [productos, setProductos] = useState<any[] | null>(null);
  const [error, setError] = useState<string>("");
  const [lowStock, setLowStock] = useState<number>(0);
  const [totalUnidades, setTotalUnidades] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        
        const res = await fetch("/api/detalle_compras", { cache: "no-store" });

        if (!res.ok) {
          if (res.status === 404) {
            if (!cancelled) setProductos([]);
            return;
          }
          throw new Error(`HTTP ${res.status}`);
        }

        const data: any[] = await res.json();
        const lista = data ?? [];

        
        const low = lista.filter((p) => Number(p.cantidad) < 3).length;
        const totalCantidades = lista.reduce(
          (acc, p) => acc + Number(p.cantidad),
          0
        );

        if (!cancelled) {
          setProductos(lista);
          setLowStock(low);
          setTotalUnidades(totalCantidades);
        }
      } catch (e) {
        console.error("Error al obtener /api/detalle_compras", e);
        if (!cancelled) setError("No se pudo obtener el stock");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const isLoading = productos === null && !error;
  const totalProductos = productos?.length ?? 0;

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
          <h3 className="text-md font-semibold text-gray-500">Stock total</h3>
        </div>

        {/* número grande: total de unidades */}
        <div className="col-start-2 row-start-2">
          <h4 className="text-2xl font-bold">
            {isLoading
              ? "Cargando…"
              : error
              ? "—"
              : `${totalUnidades.toLocaleString("es-CL")} unidades`}
          </h4>
        </div>

        {/* detalle: productos y low stock */}
        <div className="col-start-2 row-start-3">
          {isLoading ? (
            <span className="text-gray-500">Cargando…</span>
          ) : error ? (
            <span className="text-red-600">No se pudo obtener el stock</span>
          ) : (
            <span className="text-sm">
              {totalProductos}{" "}
              {totalProductos === 1 ? "producto" : "productos"}
              {lowStock > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span
                    className={
                      lowStock > 3 ? "text-red-500" : "text-orange-500"
                    }
                  >
                    {lowStock} con baja cantidad
                  </span>
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
