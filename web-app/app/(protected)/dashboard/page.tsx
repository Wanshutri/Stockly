"use client";

import { useState, useEffect, useMemo, ReactNode } from "react";
import SellIcon from "@mui/icons-material/Sell";
import PaidIcon from "@mui/icons-material/Paid";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import { DataGrid, GridColDef } from "@mui/x-data-grid";


interface CompraApiRaw {
  id_compra: number;
  fecha: string;
  total: string;
  monto_efectivo: string;
}

interface DetalleCompraApiRaw {
  id_compra: number;
  sku_producto: string;
  cantidad: number;
  subtotal: string;
  nombre_producto: string;
  gtin_producto: string | null;
  precio_unitario: string;
  marca_producto: string;
  categoria_producto: string;
}

// ===============================================================
// 2. Tipos internos del dashboard
// ===============================================================
interface Producto {
  sku: string;
  nombre: string;
  id_categoria: number;
  categoria_nombre: string;
}

interface DetalleCompra {
  sku: string;
  cantidad: number;
  subtotal: string;
  producto: Producto;
}

interface Venta {
  id_compra: number;
  fecha: string;
  total: string;
  monto_efectivo: string;
  detalles_compra: DetalleCompra[];
}

interface ApiResponse {
  ventas: Venta[];
}

// ===============================================================
// 3. Helpers
// ===============================================================
function formatCurrency(value: number): string {
  if (isNaN(value)) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  color: "blue" | "green" | "purple" | "amber";
  isLoading: boolean;
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  color,
  isLoading,
}: KpiCardProps) {
  const colorMap = {
    blue: {
      iconBg: "bg-sky-100",
      iconColor: "text-sky-700",
      ring: "ring-sky-200",
    },
    green: {
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-700",
      ring: "ring-emerald-200",
    },
    purple: {
      iconBg: "bg-fuchsia-100",
      iconColor: "text-fuchsia-700",
      ring: "ring-fuchsia-200",
    },
    amber: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-700",
      ring: "ring-amber-200",
    },
  };

  const { iconBg, iconColor, ring } = colorMap[color];

  const displayValue = isLoading ? "Cargando…" : value;
  const displaySubtitle = isLoading ? "..." : subtitle;

  return (
    <div
      className={`shadow-md p-5 rounded-2xl bg-white border border-gray-100 h-full flex flex-col justify-between ring-1 ${ring} transition-transform hover:-translate-y-0.5 hover:shadow-lg`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`p-3 rounded-2xl ${iconBg} ${iconColor}`}>{icon}</div>
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] text-right">
          {title}
        </h3>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-extrabold text-gray-900 mb-1 truncate">
          {displayValue}
        </p>
        <p className="text-xs text-gray-500">{displaySubtitle}</p>
      </div>
    </div>
  );
}

// ===============================================================
// 4. Página principal del Dashboard
// ===============================================================
export default function DashboardPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.debug(
          "[Dashboard] Fetching /api/compras y /api/detalle_compras..."
        );

        const [comprasRes, detallesRes] = await Promise.all([
          fetch("/api/compras", { cache: "no-store" }),
          fetch("/api/detalle_compras", { cache: "no-store" }),
        ]);

        if (!comprasRes.ok) {
          throw new Error(
            `HTTP ${comprasRes.status} - Error al cargar /api/compras`
          );
        }
        if (!detallesRes.ok) {
          throw new Error(
            `HTTP ${detallesRes.status} - Error al cargar /api/detalle_compras`
          );
        }

        const comprasJson: CompraApiRaw[] = await comprasRes.json();
        const detallesJson: DetalleCompraApiRaw[] = await detallesRes.json();

        // Mapeo nombreCategoria -> idCategoria numérico
        const categoriaIdMap = new Map<string, number>();
        let nextCategoriaId = 1;

        const ventas: Venta[] = comprasJson.map((compra) => {
          const detallesDeEstaCompra: DetalleCompra[] = detallesJson
            .filter((det) => det.id_compra === compra.id_compra)
            .map((det) => {
              if (!categoriaIdMap.has(det.categoria_producto)) {
                categoriaIdMap.set(det.categoria_producto, nextCategoriaId++);
              }
              const idCat = categoriaIdMap.get(det.categoria_producto) ?? 0;

              return {
                sku: det.sku_producto,
                cantidad: det.cantidad,
                subtotal: det.subtotal,
                producto: {
                  sku: det.sku_producto,
                  nombre: det.nombre_producto,
                  id_categoria: idCat,
                  categoria_nombre: det.categoria_producto,
                },
              };
            });

          return {
            id_compra: compra.id_compra,
            fecha: compra.fecha,
            total: compra.total,
            monto_efectivo: compra.monto_efectivo,
            detalles_compra: detallesDeEstaCompra,
          };
        });

        setData({ ventas });
      } catch (e) {
        console.error("[Dashboard] fetchData error", e);
        setError(
          e instanceof Error ? e.message : "Ocurrió un error desconocido"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---------------------------------------------------------------
  // 4.2. Cálculo de métricas (useMemo)
  // ---------------------------------------------------------------
  const kpiData = useMemo(() => {
    if (!data?.ventas || data.ventas.length === 0) {
      return {
        totalVentas: 0,
        numVentas: 0,
        avgTicket: 0,
        totalItems: 0,
        totalEfectivo: 0,
      };
    }

    let totalVentas = 0;
    let totalEfectivo = 0;
    let totalItems = 0;

    for (const venta of data.ventas) {
      totalVentas += Number(venta.total);
      totalEfectivo += Number(venta.monto_efectivo);

      for (const det of venta.detalles_compra) {
        totalItems += det.cantidad;
      }
    }

    const numVentas = data.ventas.length;
    const avgTicket = numVentas > 0 ? totalVentas / numVentas : 0;

    return {
      totalVentas,
      numVentas,
      avgTicket,
      totalItems,
      totalEfectivo,
    };
  }, [data]);

  // Ventas por categoría (para Donut)
  const categoryChartData = useMemo(() => {
    if (!data?.ventas) return [];

    const categoryMap = new Map<string, number>();

    for (const venta of data.ventas) {
      for (const det of venta.detalles_compra) {
        const cat = det.producto.categoria_nombre;
        const subtotal = Number(det.subtotal);
        const current = categoryMap.get(cat) || 0;
        categoryMap.set(cat, current + subtotal);
      }
    }

    return Array.from(categoryMap.entries()).map(([label, value], id) => ({
      id,
      value,
      label,
    }));
  }, [data]);

  // Top 5 productos por ingresos
  const topProductsData = useMemo(() => {
    if (!data?.ventas) return { labels: [], values: [] };

    const productMap = new Map<string, number>();

    for (const venta of data.ventas) {
      for (const det of venta.detalles_compra) {
        const name = det.producto.nombre;
        const subtotal = Number(det.subtotal);
        const current = productMap.get(name) || 0;
        productMap.set(name, current + subtotal);
      }
    }

    const sorted = Array.from(productMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      labels: sorted.map(([name]) => name),
      values: sorted.map(([, value]) => value),
    };
  }, [data]);

  // Ventas por día (solo efectivo / total)
  const salesByDay = useMemo(() => {
    if (!data?.ventas) return { days: [], totals: [] };

    const dayMap = new Map<string, number>();

    for (const venta of data.ventas) {
      const d = new Date(venta.fecha);
      const key = d.toISOString().substring(0, 10); // yyyy-mm-dd
      const current = dayMap.get(key) || 0;
      // podrías usar Number(venta.monto_efectivo) si quieres explícitamente efectivo
      dayMap.set(key, current + Number(venta.total));
    }

    const sorted = Array.from(dayMap.entries()).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    const days = sorted.map(([iso]) =>
      new Date(iso).toLocaleDateString("es-CL")
    );
    const totals = sorted.map(([, v]) => v);

    return { days, totals };
  }, [data]);

  // Ventas por hora del día (línea)
  const salesByHour = useMemo(() => {
    if (!data?.ventas) return { hours: [], values: [] };

    const buckets = new Array(24).fill(0);

    for (const venta of data.ventas) {
      const d = new Date(venta.fecha);
      const hour = d.getHours();
      buckets[hour] += Number(venta.total);
    }

    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    return { hours, values: buckets };
  }, [data]);

  // Tabla: columnas y filas
  const columns: GridColDef[] = [
    { field: "id_compra", headerName: "ID", width: 80 },
    {
      field: "fecha",
      headerName: "Fecha",
      width: 190,
      valueFormatter: (params : any) =>
        new Date(params.value).toLocaleString("es-CL"),
    },
    {
      field: "total",
      headerName: "Total",
      width: 130,
      renderCell: (params) => (
        <span className="font-semibold text-sky-700">
          {formatCurrency(Number(params.value))}
        </span>
      ),
    },
    {
      field: "itemCount",
      headerName: "Ítems",
      type: "number",
      width: 90,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "monto_efectivo",
      headerName: "Efectivo",
      width: 130,
      renderCell: (params) => (
        <span className="text-emerald-700 font-medium">
          {formatCurrency(Number(params.value))}
        </span>
      ),
    },
  ];

  const rows = useMemo(() => {
    if (!data?.ventas) return [];
    return data.ventas.map((venta) => ({
      id: venta.id_compra,
      id_compra: venta.id_compra,
      fecha: venta.fecha,
      total: Number(venta.total),
      itemCount: venta.detalles_compra.length,
      monto_efectivo: Number(venta.monto_efectivo),
    }));
  }, [data]);

  // ---------------------------------------------------------------
  // 4.3. Render
  // ---------------------------------------------------------------
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-md max-w-lg">
          <h2 className="font-bold text-lg mb-1">Error al cargar datos</h2>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const chartBoxStyle =
    "bg-white p-5 rounded-2xl shadow-md border border-gray-100";

  const axisLabelStyle = { fontSize: 11 };
  const tickLabelStyle = { fontSize: 11 };

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="space-y-2">
          <p className="text-sm text-gray-500">
            Resumen de ventas en efectivo y rendimiento de productos.
          </p>
        </header>

        {/* FILA 1: KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Ventas"
            value={formatCurrency(kpiData.totalVentas)}
            subtitle={
              isLoading ? "" : `${kpiData.numVentas} ventas en efectivo`
            }
            icon={<PaidIcon fontSize="large" />}
            color="blue"
            isLoading={isLoading}
          />
          <KpiCard
            title="Nº de Ventas"
            value={kpiData.numVentas.toLocaleString("es-CL")}
            subtitle={isLoading ? "" : "Transacciones registradas"}
            icon={<ShoppingCartIcon fontSize="large" />}
            color="purple"
            isLoading={isLoading}
          />
          <KpiCard
            title="Ticket Promedio"
            value={formatCurrency(kpiData.avgTicket)}
            subtitle={isLoading ? "" : "Promedio por compra"}
            icon={<SellIcon fontSize="large" />}
            color="green"
            isLoading={isLoading}
          />
          <KpiCard
            title="Ítems Vendidos"
            value={kpiData.totalItems.toLocaleString("es-CL")}
            subtitle={isLoading ? "" : "Cantidad total de productos"}
            icon={<Inventory2Icon fontSize="large" />}
            color="amber"
            isLoading={isLoading}
          />
        </section>

        {/* FILA 2: Ventas en el tiempo */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Barras: Ventas por día */}
          <div className={chartBoxStyle}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Ventas diarias (efectivo)
            </h2>
            {isLoading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : salesByDay.days.length === 0 ? (
              <p className="text-sm text-gray-500">No hay datos suficientes.</p>
            ) : (
              <BarChart
                xAxis={[
                  {
                    data: salesByDay.days,
                    scaleType: "band",
                    tickLabelStyle,
                  },
                ]}
                series={[
                  {
                    data: salesByDay.totals,
                    label: "Total diario",
                    color: "#0EA5E9", // sky-500
                  },
                ]}
                height={300}
                margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
              />
            )}
          </div>

          {/* Línea: Ventas por hora */}
          <div className={chartBoxStyle}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Distribución de ventas por hora
            </h2>
            {isLoading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : (
              <LineChart
                xAxis={[
                  {
                    data: salesByHour.hours,
                    scaleType: "band",
                    tickLabelStyle,
                  },
                ]}
                yAxis={[
                  {
                    label: "Total (CLP)",
                    labelStyle: axisLabelStyle,
                    tickLabelStyle,
                  },
                ]}
                series={[
                  {
                    data: salesByHour.values,
                    label: "Ventas por hora",
                    color: "#F97316", // orange-500
                    area: true,
                  },
                ]}
                height={300}
                margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
              />
            )}
          </div>
        </section>

        {/* FILA 3: Mix de productos */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Donut categorías */}
          <div className={chartBoxStyle}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Ventas por categoría
            </h2>
            {isLoading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : categoryChartData.length === 0 ? (
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
                  },
                ]}
                height={300}
                margin={{ right: 140 }}
                slotProps={{
                  legend: {
                    direction: "vertical",
                    position: { vertical: "middle", horizontal: "end" },
                  },
                }}
              />
            )}
          </div>

          {/* Top 5 productos */}
          <div className={chartBoxStyle}>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Top 5 productos por ingresos
            </h2>
            {isLoading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : topProductsData.labels.length === 0 ? (
              <p className="text-sm text-gray-500">No hay datos de productos.</p>
            ) : (
              <BarChart
                xAxis={[
                  {
                    label: "Ingresos (CLP)",
                    labelStyle: axisLabelStyle,
                    tickLabelStyle,
                  },
                ]}
                yAxis={[
                  {
                    data: topProductsData.labels,
                    scaleType: "band",
                    tickLabelStyle,
                  },
                ]}
                series={[
                  {
                    data: topProductsData.values,
                    label: "Ventas",
                    color: "#22C55E", // green-500
                  },
                ]}
                layout="horizontal"
                height={300}
                margin={{ top: 20, right: 20, bottom: 40, left: 140 }}
              />
            )}
          </div>
        </section>

        {/* FILA 4: Tabla de ventas recientes */}
        <section className={chartBoxStyle}>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Transacciones recientes
          </h2>
          {isLoading ? (
            <p className="text-sm text-gray-500">Cargando...</p>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              pageSizeOptions={[5, 10]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5, page: 0 } },
              }}
              disableRowSelectionOnClick
              sx={{
                border: 0,
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: "bold",
                  color: "#4B5563",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#F9FAFB",
                },
              }}
            />
          )}
        </section>
      </div>
    </div>
  );
}
