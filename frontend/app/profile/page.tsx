import React from "react";
import Image from "next/image"; // Para la imagen de perfil

// --- Iconos para Perfil ---
const UserCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  // Icono placeholder si no hay imagen
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21.75a8.966 8.966 0 01-5.982-2.975M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);
const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);


export default function Page() {
  // Datos de ejemplo del usuario (reemplazar con datos reales)
  const user = {
    name: "Ignacio Cordero",
    role: "Jefe de Proyecto",
    email: "ignacio.cordero@ejemplo.com",
    phone: "+56 9 1234 5678", // Opcional
    imageUrl: "" // Dejar vacío para mostrar placeholder, o poner URL
  };

  return (
    // Asumiendo que tu layout.tsx ya provee el fondo bg-gray-50 y el navbar/footer
    <main className="flex-grow p-4 mt-8 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto"> {/* Ancho máximo para la página de perfil */}
        
        {/* Título de la Página */}
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
          Mi Perfil
        </h2>

        {/* Contenedor Principal (Tarjeta Blanca) */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          
          {/* Grid para dividir perfil y detalles */}
          <div className="grid grid-cols-1 md:grid-cols-3">
            
            {/* --- COLUMNA IZQUIERDA: Info Básica y Foto --- */}
            <div className="md:col-span-1 bg-gray-50 p-6 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col items-center text-center">
              {/* Foto de Perfil */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt="Foto de perfil"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="96px"
                  />
                ) : (
                  <UserCircleIcon className="w-full h-full text-gray-400" />
                )}
              </div>
              
              {/* Nombre y Rol */}
              <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.role}</p>
            </div>

            {/* --- COLUMNA DERECHA: Detalles y Acciones --- */}
            <div className="md:col-span-2 p-6 space-y-6">
              
              {/* Detalles */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Detalles de la Cuenta</h4>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Correo Electrónico</dt>
                    <dd className="mt-1 text-md text-gray-900">{user.email}</dd>
                  </div>
                  {user.phone && ( // Mostrar solo si hay teléfono
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                      <dd className="mt-1 text-md text-gray-900">{user.phone}</dd>
                    </div>
                  )}
                  {/* Puedes añadir más campos aquí (Departamento, etc.) */}
                </dl>
              </div>

              {/* Acciones */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Acciones</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex items-center justify-center gap-2 py-2.5 px-4
                                     bg-blue-600 text-white font-semibold rounded-lg shadow-sm
                                     hover:bg-blue-700 transition-colors
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                    <PencilIcon className="w-4 h-4" />
                    Editar Perfil
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 px-4
                                     bg-white text-gray-700 font-semibold rounded-lg shadow-sm
                                     border border-gray-300 hover:bg-gray-50 transition-colors
                                     focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">
                    <KeyIcon className="w-4 h-4" />
                    Cambiar Contraseña
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}