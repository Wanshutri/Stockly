"use client";

import SellIcon from '@mui/icons-material/Sell';
import { useEffect, useState } from 'react';

export default function HomeVentas() {

    // ahora puede ser null para que isLoading tenga sentido
    const [ventas, setVentas] = useState<any[] | null>(null);
    const [error, setError] = useState<string>("");

    const [gananciasHoy, setGananciasHoy] = useState<number>(0);
    const [gananciasMesPasado, setGananciasMesPasado] = useState<number>(0);

    useEffect(() => {
        let cancelled = false;

        const fetchVentas = async () => {
            try {

                const res = await fetch("/api/compras", { method: "GET", cache: "no-store" });
                if (!res.ok) {
                    if (res.status === 404) {
                        if (!cancelled) setVentas([]);
                        return;
                    }
                    throw new Error(`HTTP ${res.status}`);
                }


                const data: any[] = await res.json();

                if (!cancelled) {
                    const lista = data ?? [];
                    setVentas(lista);


                    const totalGanancias = lista.reduce(
                        (acc: number, venta: any) => acc + Number(venta.total),
                        0
                    );
                    setGananciasHoy(totalGanancias);


                    setGananciasMesPasado(800000);
                }
            } catch (e) {
                if (!cancelled) setError("No se pudo obtener las ventas");
            }
        };

        fetchVentas();
        return () => { cancelled = true };
    }, []);

    const isLoading = ventas === null && !error;
    const ventasList = ventas ?? [];


    const porcentaje = gananciasMesPasado > 0
        ? ((gananciasHoy - gananciasMesPasado) / gananciasMesPasado) * 100
        : 0;

    const porcentajeColor =
        porcentaje > 0 ? "text-green-600"
            : porcentaje < 0 ? "text-red-600"
                : "text-gray-500";

    return (
        <div className="shadow-md p-5 w-full rounded-xl bg-white hover:bg-gray-100 hover:shadow-lg transition-[background-color,box-shadow] duration-300">
            <div className="grid grid-cols-[30%_1fr] grid-rows-3 gap-0">

                <div className="col-span-1 row-span-3 flex flex-col items-center justify-center p-4">
                    <div className='bg-blue-200 p-3 rounded-full'>
                        <SellIcon fontSize='large' color='primary' />
                    </div>
                </div>

                <div className="col-start-2 row-start-1">
                    <h3 className='text-md font-semibold text-gray-500'>Ventas de hoy</h3>
                </div>

                <div className="col-start-2 row-start-2">
                    <h4 className='text-2xl font-bold'>
                        {isLoading
                            ? "Cargando…"
                            : error
                                ? "—"
                                : ventasList.length === 0
                                    ? "Sin ventas"
                                    : `$${gananciasHoy.toLocaleString("es-CL")}`
                        }
                    </h4>
                </div>

                <div className="col-start-2 row-start-3">
                    <p className="text-sm text-black/90">
                       Totales de venta diarios de <span className="text-orange-500 font-medium">STOCKY</span>
                    </p>


                </div>

            </div>
        </div>
    );
}
