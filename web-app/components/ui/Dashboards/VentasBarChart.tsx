import { CompraType } from '@/types/db';
import { BarChart } from '@mui/x-charts/BarChart';

type Props = {
    data: CompraType[];
};

export default function VentasBarChart({ data }: Props) {
    // Objeto para acumular la cantidad de productos vendidos por categoría
    const ventasPorCategoria: Record<string, number> = {};

    data.forEach((compra: CompraType) => {
        compra.detalles_compra?.forEach((detalle) => {
            const categoria = detalle.producto.tipo_categoria.nombre_categoria;
            const cantidad = detalle.cantidad;

            if (ventasPorCategoria[categoria]) {
                ventasPorCategoria[categoria] += cantidad;
            } else {
                ventasPorCategoria[categoria] = cantidad;
            }
        });
    });

    // Preparar los datos para el gráfico
    const xAxis = Object.keys(ventasPorCategoria);
    const yAxis = Object.values(ventasPorCategoria);

    return (
        <BarChart
            xAxis={[
                {
                    id: 'categorias',
                    data: xAxis,
                },
            ]}
            series={[
                {
                    id: 'ventas-por-categoria',
                    data: yAxis,
                },
            ]}
            height={300}
        />
    );
}
