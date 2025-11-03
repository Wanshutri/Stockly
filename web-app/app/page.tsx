import HomeAccess from "@/components/ui/HomeAccess";
import HomeClients from "@/components/ui/HomeClients";
import HomeStart from "@/components/ui/HomeStart";
import HomeStock from "@/components/ui/HomeStock";
import HomeVentas from "@/components/ui/HomeVentas";
import StoreIcon from '@mui/icons-material/Store';
import InventoryIcon from '@mui/icons-material/Inventory';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function Home() {

  return (
    <div className="w-full mt-[5rem]">
      <div className="md:w-[70%] mx-auto w-[90%]">
        <HomeStart />
        <div className="mt-10">
          <div>
            <h2 className="text-2xl font-bold mb-4">Resumen de hoy</h2>
            <div className="grid lg:grid-cols-3 lg:gap-y-5 gap-y-15 gap-x-5">
              <HomeVentas></HomeVentas>
              <HomeStock></HomeStock>
              <HomeClients></HomeClients>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mt-5 mb-4">Acceso Rápido</h2>
            <div className="grid lg:grid-cols-3 lg:gap-y-5 gap-y-15 gap-x-5">
              <HomeAccess icon={StoreIcon} titulo="Módulo de ventas y pagos" url="/ventas"
                descripcion="Accede a boletas, pagos y reportes de ventas."></HomeAccess>

              <HomeAccess icon={InventoryIcon} titulo="Módulo de Bodega" url="/bodega"
                descripcion="Gestiona inventario, productos y proveedores."></HomeAccess>

              <HomeAccess icon={AdminPanelSettingsIcon} titulo="Administración" url="/admin"
                descripcion="Configura usuarios y ajustes del sistema."></HomeAccess>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
