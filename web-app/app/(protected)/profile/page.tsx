"use client"
import Footer from "@/components/layout/Footer"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

type FetchedUser = {
    id_usuario: number
    nombre: string
    email: string
    activo: boolean
    id_tipo: number
}

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const [user, setUser] = useState<FetchedUser | null>(null)
    const [loadingUser, setLoadingUser] = useState(false)

    useEffect(() => {
        async function load() {
            // `session.user` comes from next-auth types; cast to any to avoid build errors
            const userId = (session?.user as any)?.id
            if (!userId) return
            setLoadingUser(true)
            try {
                const res = await fetch(`/api/usuarios?id=${encodeURIComponent(userId)}`)
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setUser(data.user ?? null)
            } catch (err) {
                console.error(err)
                setUser(null)
            } finally {
                setLoadingUser(false)
            }
        }
        load()
    }, [session])

    if (status === "loading") return <div>Loading session...</div>
    if (!session?.user) return <div>No estás logueado</div>

    return (
        <div>
            <main>
                <h1 className="text-2xl mb-4">Perfil</h1>
                <div className="bg-white p-4 rounded shadow">
                    <p><strong>Id:</strong> {(session.user as any).id}</p>
                    {loadingUser && <p>Cargando datos del usuario...</p>}
                    {user && (
                        <>
                            <p><strong>Nombre:</strong> {user.nombre}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Tipo de Usuario:</strong> {user.id_tipo}</p>
                            <p><strong>Estado:</strong> {user.activo ? 'Activo' : 'Inactivo'}</p>
                            <pre className="mt-4 text-sm bg-gray-100 p-2 rounded">{JSON.stringify(user, null, 2)}</pre>
                        </>
                    )}
                    {!loadingUser && !user && <p>No se encontraron datos del usuario.</p>}
                </div>
            </main>
            <footer>
                <Footer />
            </footer>
        </div>
    )
}
