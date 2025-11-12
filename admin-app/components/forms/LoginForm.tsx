"use client";

import { useState } from "react";
import { signIn, type SignInResponse } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react"; 
import Link from "next/link"; 
// import Image from "next/image"; // Ya no lo necesitamos si usamos solo SVG

// --- Iconos SVG (ahora incluyendo AdminPanelSettingsIcon) ---
// Si no tienes @mui/icons-material instalado:
// const AdminIcon = (props: React.SVGProps<SVGSVGElement>) => (
//   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
//     <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.5c.55 0 1.02.398 1.11.94l.167.992c.094.56.544.975 1.1.928l1.73-.288c.55-.092 1.05.143 1.257.65l.84.97c.2.23.2.562 0 .792l-.84.97a1.125 1.125 0 01-1.257.65l-1.73-.288c-.55-.047-1.006.368-1.1.928l-.168.992c-.09.542-.56.94-1.11.94h-2.5c-.55 0-1.02-.398-1.11-.94l-.167-.992a1.125 1.125 0 01-1.1-.928l-1.73.288c-.55.092-1.05-.143-1.257-.65l-.84-.97a1.125 1.125 0 010-.792l.84-.97c.2-.23.69-.462 1.257-.65l1.73-.288a1.125 1.125 0 011.1-.928l.167-.992z" />
//     <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25a1.125 1.125 0 110-2.25 1.125 1.125 0 010 2.25z" />
//   </svg>
// );
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Este es el nuevo icono
import MailIcon from '@mui/icons-material/Mail'; // Si usas MUI icons
import LockIcon from '@mui/icons-material/Lock'; // Si usas MUI icons


// Este spinner ya estaba definido en Tailwind
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

        const res = (await signIn("credentials", {
            redirect: false,
            email,
            password,
        })) as SignInResponse | undefined;

        setLoading(false);

        if (res?.error) {
            if (res.error === "CredentialsSignin") {
                setError("Correo electrónico o contraseña incorrectos.");
            } else {
                setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
            }
            return;
        }

        router.push("/");
        router.refresh(); 
    }

    return (
        <form 
            onSubmit={onSubmit} 
            className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100"
        >
            {/* Encabezado con el nuevo icono de Administración */}
            <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                        {/* --- NUEVO ICONO AQUÍ --- */}
                        <AdminPanelSettingsIcon className="w-8 h-8 text-blue-600" /> 
                        {/* --- FIN NUEVO ICONO --- */}
                    </div>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                    Iniciar Sesión
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                    Accede a tu cuenta de administrador.
                </p>
            </div>

            {/* Campos del formulario */}
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