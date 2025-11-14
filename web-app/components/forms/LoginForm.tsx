"use client";

import { useEffect, useState } from "react";
import { signIn, useSession, type SignInResponse } from "next-auth/react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { Button, TextField } from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const { status } = useSession(); // "loading" | "authenticated" | "unauthenticated"
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/"); // redirige apenas la sesión está lista
        }
    }, [status, router]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const res = (await signIn("credentials", {
            redirect: false,
            email,
            password,
        })) as SignInResponse | undefined;

        setLoading(false);

        // Manejo robusto del resultado
        if (!res) {
            setError("Ocurrió un error inesperado. Intenta nuevamente.");
            return;
        }

        // NextAuth suele devolver `res.error` cuando falla la auth.
        if (res.error) {
            setError("Credenciales incorrectas");
            return;
        }

        // Opcional: revisar status si lo usas en tu configuración
        if ("status" in res && res.status && res.status !== 200) {
            setError("Credenciales incorrectas");
            return;
        }

        // fallback: si signIn no devolvió error pero status aún es loading,
        // esperamos que useEffect haga la redirección cuando cambie a authenticated.
        // Si después de 2s sigue sin autenticarse, forzamos una comprobación
        // (esto ayuda cuando hay delay en cookies o en la sesión).
        setTimeout(() => {
            if (status !== "authenticated") {
                // forzar recarga completa — rompe SPA pero útil como fallback
                window.location.href = "/";
            }
        }, 200);
    }

    return (
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-6 rounded shadow-xl">
            <div className="flex justify-center mb-10">
                <div className="text-center">
                    <div className="p-2 w-min bg-blue-200 mx-auto rounded-full">
                        <AccountCircleIcon className="text-blue-700" fontSize="large" />
                    </div>
                    <h2 className="text-3xl mb-4 font-bold">Iniciar sesión</h2>
                    <p>¡Que bueno tenerte de vuelta!</p>
                </div>
            </div>

            <div className="mb-5">
                <TextField
                    label="Correo Electronico"
                    variant="outlined"
                    required
                    type="email"
                    className="block mt-1 block w-full border rounded px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="mb-5">
                <TextField
                    label="Contraseña"
                    variant="outlined"
                    required
                    type="password"
                    className="block mt-1 block w-full border rounded px-3 py-2"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div className={`mb-2 text-center ${error ? "text-red-600" : "text-white"}`}>{error ?? "."}</div>

            <Button fullWidth variant="contained" type="submit" disabled={loading}>
                {loading ? "Ingresando..." : "Iniciar Sesión"}
            </Button>
        </form>
    );
}
