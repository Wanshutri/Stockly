import BodegaLayout from "@/components/layout/BodegaLayout";

console.log("Bodega page loaded");

export default function BodegaPage() {

    return (
        <div className="mt-[8rem] min-h-screen md:w-[80%] mx-auto w-[90%]">
            <h1>Gestión de inventario</h1>
            <BodegaLayout />
        </div>
    )
}
