"use client"
// Pon esto al inicio de tu archivo de página

import { useState, useEffect, ReactNode, useMemo } from 'react';

// --- Iconos de Material UI ---
import SellIcon from '@mui/icons-material/Sell';
import PaidIcon from '@mui/icons-material/Paid';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';

// --- Componente de Tabla MUI X ---
// ¡Asegúrate de tener @mui/x-data-grid instalado!
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// =========================================================================
// 1. Tipos de Datos 
// =========================================================================
interface Producto {
  sku: string;
  nombre: string;
  id_categoria: number;
}

interface DetalleCompra {
  sku: string;
  cantidad: number;
  subtotal: string; // "29990"
  producto: Producto;
}

interface Venta {
  id_compra: number;
  fecha: string; // "2025-11-12T00:00:00.000Z"
  total: string; // "451"
  detalles_compra: DetalleCompra[];
}

interface ApiResponse {
  ventas: Venta[];
}

// =========================================================================
// 2. FUNCIÓN DE UTILIDAD (Helper)
// =========================================================================
function formatCurrency(value: number): string {
  if (isNaN(value)) {
    return "$0";
  }
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}


interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'purple';
  isLoading: boolean;
}

function KpiCard({ title, value, subtitle, icon, color, isLoading }: KpiCardProps) {
  const colorMap = {
    blue: { iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    green: { iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    purple: { iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  };
  const { iconBg, iconColor } = colorMap[color];

  const displayValue = isLoading ? "Cargando…" : value;
  const displaySubtitle = isLoading ? "..." : subtitle;

  return (
    <div className="shadow-lg p-5 rounded-xl bg-white border border-gray-100 h-full">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-full ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <h3 className='text-sm font-medium text-gray-500 uppercase tracking-wider text-right'>
          {title}
        </h3>
      </div>
      <div className="mt-4">
        <h4 className='text-3xl font-extrabold text-gray-800 mb-1 truncate'>
          {displayValue}
        </h4>
        <p className="text-sm text-gray-500">{displaySubtitle}</p>
      </div>
    </div>
  );
}


export default function DashboardPage() {

  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- 1. LECTURA DE DATOS DE LA API ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ventas'); // Llama a tu API
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - No se pudo cargar la data`);
        }
        const jsonData = await res.json();
        setData(jsonData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Un error desconocido ocurrió");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. PROCESAMIENTO Y AGREGACIÓN DE DATOS (La Magia) ---
  // Usamos `useMemo` para que estos cálculos pesados solo se 
  // ejecuten cuando la `data` cambia, no en cada render.

  // --- 2a. Cálculo de KPIs (Tarjetas Superiores) ---
  const kpiData = useMemo(() => {
    if (!data?.ventas || data.ventas.length === 0) {
      return { totalVentas: 0, numVentas: 0, avgOrderValue: 0 };
    }

    // Aquí leemos `venta.total` de tu JSON
    const totalVentas = data.ventas.reduce(
      (acc, venta) => acc + Number(venta.total),
      0
    );

    const numVentas = data.ventas.length;
    const avgOrderValue = numVentas > 0 ? totalVentas / numVentas : 0;

    return { totalVentas, numVentas, avgOrderValue };

  }, [data]);

  // --- 2b. Agregación para Gráfico de Categorías (Donut) ---
  const categoryChartData = useMemo(() => {
    if (!data?.ventas) return [];

    const categoryMap = new Map<string, number>();

    // Aquí leemos `detalles_compra` y `producto` de tu JSON
    for (const venta of data.ventas) {
      for (const detalle of venta.detalles_compra) {
        const categoryName = `Categoría ${detalle.producto.id_categoria}`; // Ej: "Categoría 1"
        const subtotal = Number(detalle.subtotal);

        const currentTotal = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, currentTotal + subtotal);
      }
    }

    // Convertimos a formato de MUI X: [{ id: 0, value: 12345, label: 'Categoría 1' }]
    return Array.from(categoryMap.entries()).map(([label, value], id) => ({
      id,
      value,
      label,
    }));

  }, [data]);

  // --- 2c. Agregación para Gráfico de Top Productos (Barras) ---
  const topProductsChartData = useMemo(() => {
    if (!data?.ventas) return [];

    const productMap = new Map<string, number>();

    // Aquí leemos `producto.nombre` y `detalle.subtotal` de tu JSON
    for (const venta of data.ventas) {
      for (const detalle of venta.detalles_compra) {
        const productName = detalle.producto.nombre;
        const subtotal = Number(detalle.subtotal);

        const currentTotal = productMap.get(productName) || 0;
        productMap.set(productName, currentTotal + subtotal);
      }
    }

    // Convertimos a array, ordenamos de mayor a menor, y tomamos el Top 5
    const sortedProducts = Array.from(productMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // ¡TOP 5!

    // Formato para MUI X BarChart: { data: [29990, 16000], xAxis: [{ scaleType: 'band', data: ['Felipe', 'Felipse'] }] }
    return {
      sales: sortedProducts.map(([, sales]) => sales),
      products: sortedProducts.map(([productName]) => productName),
    };

  }, [data]);

  // --- 2d. Agregación para Gráfico de Línea (Ventas por Fecha) ---
  const salesOverTimeData = useMemo(() => {
    if (!data?.ventas) return { dates: [], sales: [] };

    const salesMap = new Map<string, number>();

    // Aquí leemos `venta.fecha` y `venta.total` de tu JSON
    for (const venta of data.ventas) {
      const date = new Date(venta.fecha).toLocaleDateString('es-CL'); // "12-11-2025"
      const total = Number(venta.total);

      const currentTotal = salesMap.get(date) || 0;
      salesMap.set(date, currentTotal + total);
    }

    // Convertimos a formato de MUI X
    const sortedEntries = Array.from(salesMap.entries()).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    return {
      dates: sortedEntries.map(([date]) => date),
      sales: sortedEntries.map(([, sales]) => sales),
    };
  }, [data]);


  // --- 3. PREPARACIÓN DE TABLA (DataGrid) ---

  // Definición de Columnas para la tabla
  const columns: GridColDef[] = [
    {
      field: 'id_compra',
      headerName: 'ID Venta',
      width: 100
    },
    {
      field: 'fecha',
      headerName: 'Fecha',
      width: 180,
      valueFormatter: (params) =>
        new Date(params.value as string).toLocaleString('es-CL'),
    },
    {
      field: 'total',
      headerName: 'Monto Total',
      width: 150,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params) => (
        <span className="font-medium text-gray-800">
          {formatCurrency(Number(params.value))}
        </span>
      )
    },
    {
      field: 'itemCount',
      headerName: 'Nº Items',
      width: 100,
      type: 'number',
      align: 'center',
      headerAlign: 'center',
    },
  ];

  // Formateo de Filas para la tabla
  const rows = useMemo(() => {
    if (!data?.ventas) return [];

    // Aquí leemos `detalles_compra.length`
    return data.ventas.map((venta) => ({
      id: venta.id_compra, // DataGrid necesita un campo 'id'
      id_compra: venta.id_compra,
      fecha: venta.fecha,
      total: Number(venta.total),
      itemCount: venta.detalles_compra.length,
    }));
  }, [data]);


  // --- 4. RENDERIZADO DEL COMPONENTE ---

  if (error) {
    return <div className="p-8 text-red-600">Error al cargar: {error}</div>;
  }

  // Estilo común para las cajas de gráficos
  const chartBoxStyle = "bg-white p-6 rounded-xl shadow-lg border border-gray-100";
  const chartTitleStyle = "text-xl font-bold text-gray-800 mb-4";
  const textStyle: ChartsTextStyle = {
    fill: '#4A5568', // text-gray-700
    fontFamily: 'system-ui',
    fontSize: 12,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-8 space-y-8">

      {/* --- TÍTULO --- */}
      <h1 className="text-4xl font-extrabold text-gray-900">
        Dashboard Financiero
      </h1>

      {/* --- FILA 1: Tarjetas de Métricas Clave (KPIs) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          title="Total Ventas"
          value={formatCurrency(kpiData.totalVentas)}
          subtitle={isLoading ? "" : `Basado en ${kpiData.numVentas} ventas`}
          icon={<PaidIcon fontSize='large' />}
          color="blue"
          isLoading={isLoading}
        />
        <KpiCard
          title="Nº de Ventas"
          value={kpiData.numVentas.toLocaleString('es-CL')}
          subtitle={isLoading ? "" : "en el período"}
          icon={<ShoppingCartIcon fontSize='large' />}
          color="purple"
          isLoading={isLoading}
        />
        <KpiCard
          title="Venta Promedio (AOV)"
          value={formatCurrency(kpiData.avgOrderValue)}
          subtitle={isLoading ? "" : "por transacción"}
          icon={<SellIcon fontSize='large' />}
          color="green"
          isLoading={isLoading}
        />
      </div>

      {/* --- FILA 2: Gráficos (Barras y Donut) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Gráfico 1: Ventas por Categoría (Donut) */}
        <div className={`${chartBoxStyle} lg:col-span-2 h-96`}>
          <h3 className={chartTitleStyle}>Ventas por Categoría</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <PieChart
              series={[
                {
                  data: categoryChartData,
                  innerRadius: 80, // Esto lo hace un Donut
                  outerRadius: 110,
                  paddingAngle: 2,
                  cornerRadius: 5,
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  faded: { additionalRadius: -5, color: 'gray' },
                },
              ]}
              legend={{ hidden: false, direction: 'column', position: { vertical: 'middle', horizontal: 'right' } }}
              margin={{ right: 100 }}
              slotProps={{ legend: { labelStyle: textStyle } }}
              height={300}
            />
          )}
        </div>

        {/* Gráfico 2: Ventas por Fecha (Línea) */}
        <div className={`${chartBoxStyle} lg:col-span-3 h-96`}>
          <h3 className={chartTitleStyle}>Ventas por Fecha</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <LineChart
              xAxis={[{
                scaleType: 'band',
                data: salesOverTimeData.dates,
                tickLabelStyle: textStyle
              }]}
              yAxis={[{
                label: "Total (CLP)",
                valueFormatter: (value) => formatCurrency(value),
                tickLabelStyle: textStyle,
                labelStyle: textStyle
              }]}
              series={[{
                data: salesOverTimeData.sales,
                label: 'Ventas',
                color: '#3B82F6', // blue-500
                area: true, // Rellena el área bajo la línea
              }]}
              grid={{ vertical: true, horizontal: true }}
              height={300}
            />
          )}
          {salesOverTimeData.dates.length < 2 && !isLoading && (
            <p className="text-xs text-gray-500 mt-2">Nota: El gráfico se verá mejor con ventas de múltiples días.</p>
          )}
        </div>
      </div>

      {/* --- FILA 3: Gráficos (Barras Horizontales y Tabla) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Gráfico 3: Top 5 Productos (Barras Horizontales) */}
        <div className={`${chartBoxStyle} lg:col-span-2 h-[450px]`}>
          <h3 className={chartTitleStyle}>Top 5 Productos (por Ingresos)</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <BarChart
              dataset={topProductsChartData.products.map((product, i) => ({
                product,
                sales: topProductsChartData.sales[i],
              }))}
              yAxis={[{
                scaleType: 'band',
                dataKey: 'product',
                tickLabelStyle: textStyle
              }]}
              xAxis={[{
                label: 'Ingresos (CLP)',
                valueFormatter: (value) => formatCurrency(value),
                tickLabelStyle: textStyle,
                labelStyle: textStyle
              }]}
              series={[{
                dataKey: 'sales',
                label: 'Ventas',
                color: '#10B981', // green-500
                valueFormatter: (value) => formatCurrency(value)
              }]}
              layout="horizontal" // ¡Importante!
              grid={{ vertical: true }}
              height={350}
            />
          )}
        </div>

        {/* Gráfico 4: Transacciones Recientes (Tabla DataGrid) */}
        <div className={`${chartBoxStyle} lg:col-span-3 h-[450px]`}>
          <h3 className={chartTitleStyle}>Transacciones Recientes</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <DataGrid
              rows={rows}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 5, page: 0 },
                },
              }}
              pageSizeOptions={[5]}
              autoHeight
              disableRowSelectionOnClick
              sx={{
                border: 0, // Quita bordes
                '& .MuiDataGrid-cell': {
                  borderColor: '#E5E7EB', // color de borde de celda
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                  fontWeight: 'bold',
                  color: '#4A5568',
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}