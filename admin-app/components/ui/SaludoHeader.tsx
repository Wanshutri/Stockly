"use client";

import useUser from "../hooks/useUser";

export default function SaludoHeader() {

    const { user } = useUser(); // Hook para el saludo
    return (
        <p className="mt-2 text-lg text-gray-600">
            {user ? `Bienvenido de vuelta, ${user.nombre}.` : "Bienvenido."}
        </p>
    )
}