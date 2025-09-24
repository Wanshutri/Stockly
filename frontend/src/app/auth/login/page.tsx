import Link from "next/link";

export default function Login() {

  {/* Kbros si van a cambiar algo dejenlo como nota aqui , notifiquen por wsp y hagan push */}
  {/* Bro le cambia iniciar sesion por : inicilizacion de sesionsitaaaaaaaaa */}

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="w-full bg-gray-800 py-4 px-6 shadow-md">
        <h1 className="text-white font-bold text-xl">El Cubanito</h1>
      </header>
      {/* Card */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
            Iniciar Sesión
          </h2>
          <form className="space-y-4">
            {/* Seccion Usuario */}
            {/* No entiendo si el admin hace un correo o un usuario, si es correo cambiar usuario por correo y en el type colocar email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Usuario
              </label>
              <input
                type="text"
                placeholder="Ingrese su usuario"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            {/* Seccion Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Ingrese su contraseña"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition duration-200"
            >
              Ingresar
            </button>
            {/* Link Next.js Recuperar contraseña */}
            <div className="text-center mt-4">
              <Link href="/auth/forgotPassword" className="text-sm text-gray-600 hover:text-gray-800">
                Recuperar contraseña
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
