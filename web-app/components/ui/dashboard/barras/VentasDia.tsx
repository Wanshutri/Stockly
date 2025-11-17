"use client";

import { BarChart } from "@mui/x-charts/BarChart";

interface Compra {
    id_compra: number;
    fecha: string;
    total: string;
    monto_efectivo: number;
    monto_tarjeta: number;
}

interface VentasDiaProps {
    data: Compra[];
}

export default function VentasDia({ data }: VentasDiaProps) {
    const ingresosPorDiaEfectivo: Record<string, number> = {};
    const ingresosPorDiaTarjeta: Record<string, number> = {};

    data.forEach((compra) => {
        const fechaSoloDia = compra.fecha.split("T")[0];
        const montoEfectivo = Number(compra.monto_efectivo);
        const montoTarjeta = Number(compra.monto_tarjeta);

        if (!ingresosPorDiaEfectivo[fechaSoloDia]) {
            ingresosPorDiaEfectivo[fechaSoloDia] = 0;
            ingresosPorDiaTarjeta[fechaSoloDia] = 0;
        }

        ingresosPorDiaEfectivo[fechaSoloDia] += montoEfectivo;
        ingresosPorDiaTarjeta[fechaSoloDia] += montoTarjeta;
    });

    const fechas = Object.keys(ingresosPorDiaEfectivo);
    const ingresosEfectivo = Object.values(ingresosPorDiaEfectivo);
    const ingresosTarjeta = Object.values(ingresosPorDiaTarjeta);

    return (
        data.length === 0 ? (
            <p className="text-sm text-gray-500">No hay datos de productos.</p>
        ) : (
            <BarChart
                xAxis={[
                    {
                        data: fechas,
                        scaleType: "band",
                    },
                ]}
                series={[
                    {
                        data: ingresosEfectivo,
                        label: "Efectivo",
                        color: "#0EA5E9",
                    },
                    {
                        data: ingresosTarjeta,
                        label: "Tarjeta",
                        color: "#22C55E",
                    },
                ]}
                height={300}
            />
        )
    );
}
