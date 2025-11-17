"use client";
import { LineChart } from "@mui/x-charts";

type VentasDiaProps = {
    data: Compra[];
};

export default function VentaXHora({ data }: VentasDiaProps) {
    const horas = Array.from({ length: 24 }, (_, i) =>
        `${i.toString().padStart(2, "0")}:00`
    );

    const ventasPorHora: Record<string, number> = {};
    horas.forEach((h) => (ventasPorHora[h] = 0));

    // Contar ventas por hora
    data.forEach((c) => {
        const fecha = new Date(c.fecha);
        const horaStr = fecha.toLocaleTimeString("es-CL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "America/Santiago",
        });

        // solo necesitamos "HH:00"
        const hora = horaStr.split(":")[0] + ":00";

        ventasPorHora[hora] += 1;
    });


    const cantidades = horas.map((h) => ventasPorHora[h]);

    if (data.length === 0) {
        return <p className="text-sm text-gray-500">No hay datos de productos.</p>;
    }

    return (
        <LineChart
            xAxis={[
                {
                    data: horas,
                    scaleType: "band",
                    label: "Hora del día",
                },
            ]}
            yAxis={[
                {
                    label: "Cantidad de ventas",
                },
            ]}
            series={[
                {
                    data: cantidades,
                    label: "Ventas por hora",
                    color: "#F97316",
                    area: true,
                },
            ]}
            height={300}
        />
    );
}
