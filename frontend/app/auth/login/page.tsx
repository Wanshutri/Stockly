import React from "react";
import StocklyNavbar from "../../components/StocklyNavBar/StocklyNavbar";
import Link from "next/link";
import StocklyFooter from "@/app/components/StocklyFooter/StocklyFooter";

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

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
    />
  </svg>
);

const UserLoginIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21.75a8.966 8.966 0 01-5.982-2.975M9 10.5a3 3 0 116 0 3 3 0 01-6 0z"
    />
  </svg>
);

export default function Page() {
  return (
    <div>
      <header>
        <StocklyNavbar />
      </header>
      <main>
        <div>
          {/* LADO IZQUIERDO (FORMULARIO): Centramos la "ventana" tanto vertical como horizontalmente */}
          <div className="flex items-center justify-center p-8 sm:p-12 md:p-16">

            {/* Tarjeta que contiene el formulario: centrada y con tamaño fijo máximo */}
            <div id="form-window" className="w-full max-w-md rounded-2xl shadow-xl p-8 mx-auto" aria-labelledby="heading-recover">

              <div className="text-center mb-8">
                {/* ICONO DE LOGIN */}
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <UserLoginIcon className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h2 id="heading-recover" className="text-3xl font-bold tracking-tight text-gray-900">
                  Inicio de Sesión
                </h2>
                <p className="mt-3 text-sm text-gray-600">
                  Que bueno tenerte de vuelta!
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

                {/* Campo de Contraseña */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contraseña
                  </label>
                  <div className="relative mt-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="*********"
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
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Recuperar Contraseña
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
                  Login
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
      </main>
      <footer>
        <StocklyFooter/>
      </footer>
    </div>
  );
}
