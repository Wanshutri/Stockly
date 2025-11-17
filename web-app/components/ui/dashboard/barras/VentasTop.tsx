"use client";

import { BarChart } from "@mui/x-charts";

interface VentasTopProps {
    data: DetalleCompra[];
}

export default function VentasTop({ data }: VentasTopProps) {

    const unidadesPorProducto = data.reduce((acc, item) => {
        const nombre = item.nombre_producto;
        const cantidad = item.cantidad;

        if (!acc[nombre]) {
            acc[nombre] = 0;
        }

        acc[nombre] += cantidad;
        return acc;
    }, {} as Record<string, number>);

    const topProducts = Object.entries(unidadesPorProducto)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const topProductsData = {
        labels: topProducts.map(([nombre]) => nombre),
        values: topProducts.map(([, total]) => total)
    };

    return (
        <div>
            {
                data.length === 0 ?
                    <p className="text-sm text-gray-500">No hay datos de productos.</p>
                    :
                    <BarChart
                        xAxis={[
                            {
                                label: "Unidades vendidas"
                            },
                        ]}
                        yAxis={[
                            {
                                data: topProductsData.labels,
                                scaleType: "band"
                            },
                        ]}
                        series={[
                            {
                                data: topProductsData.values,
                                label: "Cantidad",
                                color: "#22C55E"
                            },
                        ]}
                        layout="horizontal"
                        height={300}
                    />
            }
        </div>
    );
}
