import Link from "next/link";
import { ElementType } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function HomeAccess({
    icon,
    url,
    titulo,
    descripcion
}: {
    icon?: ElementType;
    url: string;
    titulo: string;
    descripcion: string;
}) {
    const Icon = icon;

    return (
        <Link href={url} className="block group">
            <div className="grid shadow-lg gap-y-3 grid-cols-1 grid-rows-[40%_1fr_1fr_1fr] w-full h-full p-5 rounded-xl bg-white hover:bg-gray-100  transition-colors duration-300">
                {/* ICONO PRINCIPAL */}
                <div className="flex items-center justify-start">
                    <div className="p-4 bg-blue-100 w-min rounded-full">
                        {Icon ? <Icon fontSize="large" color="primary" /> : null}
                    </div>
                </div>

                {/* TÍTULO */}
                <div className="flex items-start">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {titulo}
                    </h3>
                </div>

                {/* DESCRIPCIÓN */}
                <div className="flex items-center">
                    <p className="text-gray-600">
                        {descripcion}
                    </p>
                </div>

                {/* FLECHA */}
                <div className="flex items-center justify-end">
                    <ArrowForwardIcon className="text-gray-400 transition-colors duration-300 group-hover:text-blue-500" />
                </div>
            </div>
        </Link>
    );
}
