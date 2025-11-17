"use client";
import { PieChart } from "@mui/x-charts";

type VentasXCat = {
    data: DetalleCompra[];
};

export default function VentasPorCategoria({ data }: VentasXCat) {
    // Agrupar por categoría
    const ventasPorCategoria: Record<string, number> = {};
    data.forEach((item) => {
        const categoria = item.categoria_producto || "Sin categoría";
        if (!ventasPorCategoria[categoria]) ventasPorCategoria[categoria] = 0;
        ventasPorCategoria[categoria] += item.cantidad;
    });

    // Calcular total
    const totalVentas = Object.values(ventasPorCategoria).reduce(
        (acc, val) => acc + val,
        0
    );

    // Generar datos para PieChart con porcentaje
    const categoryChartData = Object.entries(ventasPorCategoria).map(
        ([categoria, cantidad]) => ({
            label: categoria,
            value: totalVentas > 0 ? (cantidad / totalVentas) * 100 : 0,
        })
    );

    return (
        <div>
            {categoryChartData.length === 0 ? (
                <p className="text-sm text-gray-500">No hay datos de categorías.</p>
            ) : (
                <PieChart
                    series={[
                        {
                            data: categoryChartData,
                            innerRadius: 70,
                            outerRadius: 110,
                            paddingAngle: 3,
                            cornerRadius: 4,
                            highlightScope: { fade: "global", highlight: "item" },
                            faded: { additionalRadius: -8 },
                            valueFormatter: (item) => `${item.value.toFixed(1)}%`,
                        },
                    ]}
                    height={300}
                    slotProps={{
                        legend: {
                            direction: "vertical",
                            position: { vertical: "middle", horizontal: "end" },
                        },
                    }}
                />
            )}
        </div>
    );
}
