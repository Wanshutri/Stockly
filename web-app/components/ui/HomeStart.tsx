"use client"
import useUser from '../hooks/useUser';

export default function HomeStart() {

    const { user, loading, error, reload } = useUser();

    return (
        <div className="mt-30">
            <h1 className="text-3xl font-bold">Bienvenido, {user?.nombre}</h1>
            <p className="mt-2 text-gray-600 text-lg">Aquí tienes un resumen de la actividad de tu negocio.</p>
        </div>
    );
}