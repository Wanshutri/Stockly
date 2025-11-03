"use client"

import { useSession } from 'next-auth/react';
import useUser from '../hooks/useUser';

export default function HomeStart() {

    const { data: session } = useSession();
    const userId = (session?.user as any)?.id ?? null
    const { user, loading, error, reload } = useUser(userId);

    return (
        <div>
            <h1 className="text-3xl font-bold">Bienvenido, {user?.nombre}</h1>
            <p className="mt-2 text-gray-600 text-lg">Aquí tienes un resumen de la actividad de tu negocio.</p>
        </div>
    );
}