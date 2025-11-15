import VentasBarChart from "@/components/ui/Dashboards/VentasBarChart";
import { CompraType } from "@/types/db";

export default async function Test() {
    const res = await fetch("http://localhost/api/ventas", { cache: "no-store" });

    if (!res.ok) {
        // evita romper el componente si la API falla
        return (
            <div>
                <VentasBarChart data={[]} />
            </div>
        );
    }

    const data = await res.json();
    const dataVentas: CompraType[] = data?.ventas ?? [];

    return (
        <div className="mt-25">
            <VentasBarChart data={dataVentas} />
        </div>
    );
}
