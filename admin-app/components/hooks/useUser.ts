"use client"

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import { UsuarioType } from "@/types/db";

export default function useUser() {
    const [user, setUser] = useState<UsuarioType | null>(null); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const { data: session } = useSession();

    const userId = (session?.user as any)?.id ?? null

    const fetchUser = useCallback(async () => {
        if (!userId) {
            setUser(null);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // 3. La URL de la API es la misma
            const res = await fetch(`/api/usuarios?id=${encodeURIComponent(userId)}`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Failed to fetch user ${userId}`);
            }
            const data = await res.json();
            setUser(data.user ?? null);
        } catch (err) {
            setError(err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return { user, loading, error, reload: fetchUser } as const;
}