/*

"use client";

import { useEffect, useState } from "react";
import StocklyBarChart from "../charts/StocklyBarChart";


export default function ChartsLayout() {
    const [ventas, setVentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [clientes, setClientes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAll() {
            try {
                // ejecuta los fetchs en paralelo para eficiencia
                const [ventasRes, productosRes, clientesRes] = await Promise.all([
                    fetch("/api/ventas", { cache: "no-store" }),
                    fetch("/api/productos", { cache: "no-store" }),
                    fetch("/api/clientes", { cache: "no-store" }),
                ]);

                if (!ventasRes.ok || !productosRes.ok || !clientesRes.ok) {
                    throw new Error("Error al obtener datos de las APIs");
                }

                const [ventasData, productosData, clientesData] = await Promise.all([
                    ventasRes.json(),
                    productosRes.json(),
                    clientesRes.json(),
                ]);

                console.log(ventasData)
                console.log(productosData)
                console.log(clientesData)
                setVentas(ventasData);
                setProductos(productosData);
                setClientes(clientesData);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchAll();
    }, []);

    if (loading) return <p>Cargando gráficos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="grid gap-8 p-6">
            {ventas.length > 0 && (
                <StocklyBarChart
                    titulo="Ventas por Día"
                    labels={ventas.map((v) => v)}
                    values={ventas.map((v) => v.total)}
                />
            )}

            {productos.length > 0 && (
                <StocklyBarChart
                    titulo="Productos Más Vendidos"
                    labels={productos.map((p) => p.nombre)}
                    values={productos.map((p) => p.cantidad)}
                />
            )}

            {clientes && (
                <StocklyBarChart
                    titulo="Clientes Registrados vs Anónimos"
                    labels={["Registrados", "Anónimos"]}
                    values={[clientes.registrados, clientes.anonimos]}
                />
            )}
        </div>
    );
}

*/