import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login",
    description: "Inicia sesión en Stockly. Usa tu correo y contraseña para acceder a tu cuenta.",
    keywords: ["login", "iniciar sesión", "Stockly", "auth"],
    authors: [{ name: "Stockly" }],
    openGraph: {
        title: "Login — Stockly",
        description: "Inicia sesión en Stockly. Usa tu correo y contraseña para acceder a tu cuenta.",
        url: "/auth/login",
        siteName: "Stockly",
        locale: "es_ES",
        type: "website",
    },
};

export default function LoginLayout({ children }: { children: ReactNode }) {
    // Importar header y footer específicos de la sección si los tienes
    return <>{children}</>;
}