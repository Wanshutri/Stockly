import { productColumns, } from "@/components/definitions/DataTableColumns";
import BodegaTable from "@/components/ui/BodegaTable";

export default function BodegaPage() {

    return (
        <div className="mt-[8rem] md:w-[80%] mx-auto w-[90%]">
            <h1>Gestión de inventario</h1>
            <BodegaTable apiUrl="api/productos" columnsDef={productColumns}></BodegaTable>
        </div>
    )
}
