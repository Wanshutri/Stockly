"use client"

import { useCallback, useEffect, useState } from "react";

export type Usuario = {
    id_usuario: number;
    nombre: string;
    email: string;
    activo: boolean;
    id_tipo: number;
    [key: string]: any;
}

export default function useUser(id?: string | null) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchUser = useCallback(async () => {
        if (!id) {
            setUser(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/usuarios?id=${encodeURIComponent(id)}`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Failed to fetch user ${id}`);
            }
            const data = await res.json();
            setUser(data.user ?? null);
        } catch (err) {
            setError(err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return { user, loading, error, reload: fetchUser } as const;
}
