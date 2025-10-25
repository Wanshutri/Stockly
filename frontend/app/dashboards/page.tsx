"use client";
import React, { useMemo, useRef, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

// Datos de ejemplo
const ventasBase = [
    { mes: "Ene", ventas: 120 },
    { mes: "Feb", ventas: 90 },
    { mes: "Mar", ventas: 110 },
    { mes: "Abr", ventas: 150 },
    { mes: "May", ventas: 170 },
    { mes: "Jun", ventas: 240 },
    { mes: "Jul", ventas: 210 },
    { mes: "Ago", ventas: 260 },
    { mes: "Sep", ventas: 230 },
    { mes: "Oct", ventas: 300 },
    { mes: "Nov", ventas: 280 },
    { mes: "Dic", ventas: 340 },
];

const categoriasBase = [
    { name: "Bebidas", value: 400 },
    { name: "Snacks", value: 300 },
    { name: "Congelados", value: 200 },
    { name: "Abarrotes", value: 250 },
    { name: "Lácteos", value: 170 },
];

const COLORS = ["#ec4899", "#22d3ee", "#f97316", "#a78bfa", "#22c55e"]; // no es necesario especificar colores, pero queda más parecido al mock

export default function DashboardPage() {
    const [mes, setMes] = useState<string>("");
    const [anio, setAnio] = useState<string>("");
    const [filtro, setFiltro] = useState<string>("");
    const areaRef = useRef<HTMLDivElement>(null);

    const ventas = useMemo(() => {
        // Demo: si hay filtro, solo escalamos los valores para "simular" cambios
        const factor = filtro === "Alto" ? 1.15 : filtro === "Bajo" ? 0.9 : 1;
        return ventasBase.map((v) => ({ ...v, ventas: Math.round(v.ventas * factor) }));
    }, [filtro]);

    const categorias = useMemo(() => {
        const factor = mes ? 1.05 : 1;
        return categoriasBase.map((c) => ({ ...c, value: Math.round(c.value * factor) }));
    }, [mes]);

    const handleExportPDF = () => {
        // Solución simple y universal: imprimir la sección (los usuarios pueden guardar como PDF)
        // Si quieres html2canvas + jsPDF, se puede agregar luego.
        if (areaRef.current) {
            const originalTitle = document.title;
            document.title = "Dashboard - El Cubanito";
            window.print();
            document.title = originalTitle;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-200 text-neutral-900">

            {/* Layout */}
            <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* Main content */}
                <main ref={areaRef} className="bg-white rounded-2xl shadow p-4 md:p-6">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {/* Dashboard 1: Ventas por mes (Línea) */}
                        <section className="border rounded-2xl p-4">
                            <h2 className="text-lg font-semibold mb-3">Ventas mensuales</h2>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={ventas} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mes" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="ventas" stroke="#ec4899" strokeWidth={3} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* Dashboard 2: Participación por categoría (Pie) */}
                        <section className="border rounded-2xl p-4">
                            <h2 className="text-lg font-semibold mb-3">Participación por categoría</h2>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Tooltip />
                                        <Legend />
                                        <Pie data={categorias} dataKey="value" nameKey="name" outerRadius={100} label>
                                            {categorias.map((entry, index) => (
                                                <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    </div>
                </main>

                {/* Right bar */}
                <aside className="bg-white rounded-2xl shadow p-4 md:p-6 h-fit sticky top-4">
                    <h3 className="text-2xl font-extrabold mb-4">Estadísticas</h3>

                    <div className="space-y-4">
                        {/* Mes */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Mes</label>
                            <select
                                value={mes}
                                onChange={(e) => setMes(e.target.value)}
                                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                            >
                                <option value="">Todos</option>
                                {ventasBase.map((v) => (
                                    <option key={v.mes} value={v.mes}>
                                        {v.mes}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Año */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Año</label>
                            <select
                                value={anio}
                                onChange={(e) => setAnio(e.target.value)}
                                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                            >
                                <option value="">2025</option>
                                <option value="2024">2024</option>
                                <option value="2023">2023</option>
                            </select>
                        </div>

                        {/* Filtro */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Filtrar por</label>
                            <select
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                                className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                            >
                                <option value="">Todos</option>
                                <option value="Alto">Alto</option>
                                <option value="Medio">Medio</option>
                                <option value="Bajo">Bajo</option>
                            </select>
                        </div>

                        <button
                            onClick={handleExportPDF}
                            className="mt-4 w-full rounded-2xl bg-neutral-900 text-white px-4 py-2 text-sm font-medium shadow hover:bg-neutral-800 active:scale-[.99]"
                        >
                            Exportar a PDF
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
