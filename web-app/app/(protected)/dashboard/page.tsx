import SellIcon from "@mui/icons-material/Sell";
import PaidIcon from "@mui/icons-material/Paid";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import VentasDia from "@/components/ui/dashboard/barras/VentasDia";
import VentasTop from "@/components/ui/dashboard/barras/VentasTop";
import VentaXHora from "@/components/ui/dashboard/puntos/VentaXHora";
import VentasPorCategoria from "@/components/ui/dashboard/circular/GraficoCircular";
import KpiCard from "@/components/ui/dashboard/KpiCard";
import formatCurrency from "@/components/hooks/formatCurrency";
import DataTableDashboard from "@/components/ui/dashboard/DataTableDashboard";
import PrintButton from "@/components/forms/PrintButton";

// ===============================================================
// 4. Página principal del Dashboard
// ===============================================================

async function fetchCompras() {
  const comprasRes = await fetch(`${process.env.NEXTAUTH_URL}/api/compras`, { cache: "no-store" });
  const detallesRes = await fetch(`${process.env.NEXTAUTH_URL}/api/detalle_compras`, { cache: "no-store" });

  if (!comprasRes.ok) throw new Error(`Error al cargar /api/compras`);
  if (!detallesRes.ok) throw new Error(`Error al cargar /api/detalle_compras`);

  const compras = await comprasRes.json();
  const detalles = await detallesRes.json();

  return { compras, detalles };
}

export default async function DashboardPage() {
  const { compras, detalles } = await fetchCompras();

  // ---------------------------------------------------------------
  // 4.2. Cálculo de métricas (sin useMemo)
  // ---------------------------------------------------------------
  const kpiData = {
    totalVentas: 0,
    numVentas: 0,
    avgTicket: 0,
    totalItems: 0,
    totalEfectivo: 0,
    totalTarjeta: 0,
  };

  if (compras.length > 0) {
    for (const venta of compras) {
      kpiData.totalVentas += Number(venta.total);
      kpiData.totalEfectivo += Number(venta.monto_efectivo);
      kpiData.totalTarjeta += Number(venta.monto_tarjeta);
    }

    for (const det of detalles) {
      kpiData.totalItems += det.cantidad;
    }

    kpiData.numVentas = compras.length;
    kpiData.avgTicket = kpiData.numVentas > 0 ? kpiData.totalVentas / kpiData.numVentas : 0;
  }


  return (
    <div className="min-h-screen bg-white p-6 md:p-8 mt-15">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Resumen de ventas por método de pago y rendimiento de productos.
          </p>
          <PrintButton />
        </div>

        {/* FILA 1: KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Ventas"
            value={formatCurrency(kpiData.totalVentas)}
            subtitle={`Efectivo: ${formatCurrency(kpiData.totalEfectivo)} · Tarjeta: ${formatCurrency(kpiData.totalTarjeta)}`}
            icon={<PaidIcon fontSize="large" />}
            color="blue"
          />
          <KpiCard
            title="Nº de Ventas"
            value={kpiData.numVentas.toLocaleString("es-CL")}
            subtitle={"Transacciones registradas"}
            icon={<ShoppingCartIcon fontSize="large" />}
            color="purple"
          />
          <KpiCard
            title="Ticket Promedio"
            value={formatCurrency(kpiData.avgTicket)}
            subtitle={"Promedio por compra"}
            icon={<SellIcon fontSize="large" />}
            color="green"
          />
          <KpiCard
            title="Ítems Vendidos"
            value={kpiData.totalItems.toLocaleString("es-CL")}
            subtitle={"Cantidad total de productos"}
            icon={<Inventory2Icon fontSize="large" />}
            color="amber"
          />
        </section>

        {/* FILA 2: Ventas en el tiempo */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Ventas diarias por método de pago
            </h2>
            <VentasDia data={compras}></VentasDia>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Distribución de productos vendidos por hora
            </h2>
            <VentaXHora data={compras}></VentaXHora>
          </div>
        </section>

        {/* FILA 3: Mix de productos */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Ventas por categoría (%)
            </h2>
            <VentasPorCategoria data={detalles}></VentasPorCategoria>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Top 5 productos por ingresos
            </h2>
            <VentasTop data={detalles}></VentasTop>
          </div>
        </section>

        {/* FILA 4: Tabla de ventas recientes */}
        <section className="bg-white p-5 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Transacciones recientes
          </h2>
          <DataTableDashboard compras={compras} detalles={detalles}></DataTableDashboard>
        </section>
      </div>
    </div>
  );
}
