import React from "react";
import StocklyNavbar from "../../components/StocklyNavBar/StocklyNavbar";
import Link from "next/link";

// --- Iconos ---
const MailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />
  </svg>
);

const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
    />
  </svg>
);

export default function Page() {
  return (
    // Layout principal de la página (header, main, footer)
    <div className="">

      {/* LADO IZQUIERDO (FORMULARIO): Centramos la "ventana" tanto vertical como horizontalmente */}
      <div className="flex items-center justify-center p-8 sm:p-12 md:p-16">

        {/* Tarjeta que contiene el formulario: centrada y con tamaño fijo máximo */}
        <div className="w-full max-w-md  rounded-2xl shadow-xl p-8 mx-auto">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <KeyIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Recupera tu cuenta
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Ingresa tu correo electrónico para restablecer tu contraseña.
            </p>
          </div>

          <form className="space-y-6">

            {/* Campo de Correo Electrónico */}
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
                  className="block w-full rounded-md border-gray-300 py-3 pl-10 pr-4
                               shadow-sm
                               focus:border-blue-500 focus:ring-blue-500
                               sm:text-sm"
                />
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Volver al login
              </Link>
            </div>

            {/* Botón (CTA) */}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4
                           border border-transparent rounded-md shadow-sm
                           font-semibold text-white bg-blue-600 
                           hover:bg-blue-700
                           cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                           transition-colors duration-200"
            >
              Mandar correo
            </button>

          </form>

        </div>
      </div>

      {/* LADO DERECHO (IMAGEN): Ocupa toda la columna 
            'hidden md:block': Oculto en móvil, visible en 'md'
            Mantenemos `relative` solo si vas a usar Image con layout fill.
        */}
      <div className="hidden md:block relative">
      </div>

    </div>
  );
}
