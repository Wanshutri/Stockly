"use client"
import { SessionProvider, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    useEffect(() => {
        // On client-side navigation, check the user's activo state and sign out if inactive
        async function checkActivo() {
            try {
                const res = await fetch('/api/auth/checkActivo', { credentials: 'include' })
                if (res.status === 200) {
                    const data = await res.json()
                    if (data.activo === false) {
                        // force sign out and redirect to login
                        signOut({ callbackUrl: '/login' })
                    }
                } else if (res.status === 401) {
                    // not authenticated — do nothing (middleware will handle protected routes)
                }
            } catch (err) {
                console.error('client checkActivo error', err)
            }
        }

        checkActivo()
    }, [pathname])

    return <SessionProvider>{children}</SessionProvider>
}
