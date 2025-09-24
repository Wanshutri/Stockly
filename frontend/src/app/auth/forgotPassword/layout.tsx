import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Recuperar contraseña",
    description: "Recupera tu contraseña de Stockly. Ingresa tu correo para recibir instrucciones.",
    keywords: ["forgot password", "recuperar contraseña", "Stockly", "auth"],
    authors: [{ name: "Stockly" }],
    openGraph: {
        title: "Forgot Password — Stockly",
        description: "Recupera tu contraseña de Stockly. Ingresa tu correo para recibir instrucciones.",
        url: "/auth/forgotPassword",
        siteName: "Stockly",
        locale: "es_ES",
        type: "website",
    },
};

export default function ForgotPasswordLayout({ children }: { children: ReactNode }) {
    // Importar header y Footer para esta seccion de otro layout OMEGALUL 
    return <>{children}</>;
}