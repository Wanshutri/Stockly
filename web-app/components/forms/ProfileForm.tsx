import React, { useState, useEffect } from "react";

// --- Tipos (Asegúrate que coincidan con tu página de perfil) ---
type FetchedUser = {
  id_usuario: number;
  nombre: string;
  email: string;
  activo: boolean;
  id_tipo: number;
};

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: FetchedUser;
  // Función para actualizar el estado en la página de perfil
  onUpdate: (updatedUser: FetchedUser) => void; 
};

// --- Iconos ---
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SpinnerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function EditProfileModal({ isOpen, onClose, user, onUpdate }: ModalProps) {
  // Estado interno del formulario
  const [formData, setFormData] = useState({
    nombre: user.nombre,
    email: user.email,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Sincronizar estado del formulario cuando el modal se abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: user.nombre,
        email: user.email,
      });
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Llamada a la API (usando PATCH, un estándar para actualizaciones)
      const res = await fetch(`/api/usuarios?id=${user.id_usuario}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al actualizar el perfil.");
      }

      // Éxito
      setSuccess("¡Perfil actualizado con éxito!");
      // Pasa los nuevos datos a la página de perfil
      onUpdate({ ...user, ...formData }); 

      // Cierra el modal después de un breve momento
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Overlay (fondo oscuro)
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4 transition-opacity"
      onClick={onClose} // Cierra al hacer clic fuera
    >
      {/* Contenedor del Modal */}
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 z-50"
        onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic dentro
      >
        {/* Encabezado del Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Editar Perfil</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Campo Nombre */}
            <div>
              <label 
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre Completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 py-2.5 px-4
                           shadow-sm
                           focus:border-blue-500 focus:ring-blue-500
                           sm:text-sm"
              />
            </div>

            {/* Campo Email */}
            <div>
              <label 
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full rounded-md border-gray-300 py-2.5 px-4
                           shadow-sm
                           focus:border-blue-500 focus:ring-blue-500
                           sm:text-sm"
              />
            </div>
            
            {/* Mensajes de Estado */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</p>
            )}
          </div>

          {/* Pie del Modal (Acciones) */}
          <div className="bg-gray-50 p-6 flex justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2 px-4 bg-white text-gray-700 font-semibold rounded-lg shadow-sm
                         border border-gray-300 hover:bg-gray-50 transition-colors
                         disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2 px-4 flex items-center justify-center
                         bg-blue-600 text-white font-semibold rounded-lg shadow-sm
                         hover:bg-blue-700 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}