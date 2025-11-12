import LoginForm from "../../../components/forms/LoginForm";
import React from "react";

import DashboardIcon from '@mui/icons-material/Dashboard'; 

export default function LoginPageAdmin() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-white">
      
      {/* --- COLUMNA IZQUIERDA (Branding) --- */}
      <div className="hidden lg:flex flex-col items-center justify-center
                      bg-gradient-to-br from-blue-600 to-blue-800
                      text-white p-12 text-center">
        
        {/* REEMPLAZO DEL ICONO ROTO POR DashboardIcon */}
        <DashboardIcon sx={{ fontSize: '10rem', color: 'white' }} /> {/* Más grande para que destaque */}
        {/* O si usaras el SVG simple: <DashboardSimpleIcon className="w-40 h-40 text-white/90" /> */}
        
        <h1 className="mt-8 text-4xl font-extrabold tracking-tight">
          Acceso al Panel de Administración
        </h1>
        <p className="mt-4 text-lg text-blue-100/90 max-w-md mx-auto">
          Gestión centralizada para tu equipo. Controla usuarios, permisos y datos importantes.
        </p>
      </div>

      {/* --- COLUMNA DERECHA (Formulario) --- */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 bg-gray-50">
        <LoginForm /> 
        
        <p className="mt-8 text-sm text-gray-500">
          © 2025 Stockly. Todos los derechos reservados.
        </p>
      </div>

    </div>
  );
}