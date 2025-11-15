"use client";

import { useState } from "react";
// Se eliminan 'getSession' y 'signOut' porque ya no se usan aquí
import { signIn, type SignInResponse } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react"; 
import Link from "next/link"; 

// --- Iconos ---
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; 
import MailIcon from '@mui/icons-material/Mail'; 
import LockIcon from '@mui/icons-material/Lock'; 

const SpinnerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
// ---

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Intenta iniciar sesión
        const res = (await signIn("credentials", {
            redirect: false,
            email,
            password,
        })) as SignInResponse | undefined;

        // 2. Manejo de error de credenciales
        if (res?.error) {
            setLoading(false);
            if (res.error === "CredentialsSignin" || res.error === "default") {
                setError("Correo electrónico o contraseña incorrectos.");
            } else {
                setError(res.error); // Muestra el error de "Cuenta deshabilitada", etc.
            }
            return;
        }

        // 3. ¡ÉXITO! Redirigir directamente al home.
        // Se eliminó la validación de rol.
        router.push("/");
        router.refresh();
    }

    return (
        <form 
            onSubmit={onSubmit} 
            className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100"
        >
            <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <AdminPanelSettingsIcon className="w-8 h-8 text-blue-600" /> 
                    </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    Iniciar Sesión
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Accede a tu cuenta de administrador.
                </p>
            </div>
            <div className="space-y-6">
                <div>
                    <label 
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Correo Electrónico
                    </label>
                    <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MailIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="tu@correo.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full rounded-md border-gray-300 py-3 pl-10 pr-4
                                       shadow-sm
                                       focus:border-blue-500 focus:ring-blue-500
                                       sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between">
                        <label 
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Contraseña
                        </label>
                        <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                            ¿Olvidaste?
                        </Link>
                    </div>
                    <div className="relative mt-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full rounded-md border-gray-300 py-3 pl-10 pr-4
                                       shadow-sm
                                       focus:border-blue-500 focus:ring-blue-500
                                       sm:text-sm"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 text-center rounded-md bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                        {error}
                    </div>
                )}
                
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4
                               border border-transparent rounded-md shadow-sm
                               font-semibold text-white bg-blue-600 
                               hover:bg-blue-700
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                               transition-colors duration-200
                               disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <SpinnerIcon />
                            Ingresando...
                        </>
                    ) : (
                        "Iniciar Sesión"
                    )}
                </button>
            </div>
        </form>
    );
}