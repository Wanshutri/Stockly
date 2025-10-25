import React from 'react';
import type { Metadata } from 'next';

// Metadatos Específicos para la página de Login
export const metadata: Metadata = {
    // Título final: "Iniciar Sesión | Stockly"
    title: 'Bodega',
    description: 'Accede a la plataforma de gestión de inventario Stockly.',
};

export default function LoginLayout({ children,}: Readonly<{children: React.ReactNode;}>) {
    return (
        <div>
            {children}
        </div>
    );
}