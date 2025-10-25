"use client";

import React from "react";
import Link from "next/link"; // Link se usa para la paginación

// --- Iconos para la UI ---
const PrintIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6 18.25m0-4.421c.522.062 1.064.12 1.62.182m-1.62-.182a48.006 48.006 0 00-7.022-1.028m7.022 1.028L6 18.25m0-4.421m8.88-1.028a48.006 48.006 0 017.022 1.028m-7.022-1.028L18 18.25m0-4.421c.522.062 1.064.12 1.62.182m-1.62-.182a42.453 42.453 0 00-7.022-1.028m7.022 1.028L18 18.25m0-4.421c.24.03.48.062.72.096m-.72-.096a42.415 42.415 0 00-10.56 0m10.56 0L18 18.25M6 6.25h12M6 10.25h12M6 14.25h12" />
  </svg>
);

const AnularIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
  </svg>
);

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const BoletaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);


export default function Page() {
  const [selectedBoleta, setSelectedBoleta] = React.useState(1234);

  return (
    // Asumiendo que tu layout.tsx ya provee el fondo bg-gray-50 y el navbar/footer
    <main className="flex-grow p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Título de la Página */}
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
          Reimpresión de Boletas
        </h2>

        {/* Contenedor Principal (Tarjeta Blanca Única) */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          
          {/* --- CORRECCIÓN DE ESPACIO ---
            Cambiado de 'p-6' a 'p-8' para dar más "aire" a todo el contenido.
          */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8 p-8">
            
            {/* --- COLUMNA 1: LISTA DE BOLETAS --- */}
            <div className="flex flex-col pr-4 border-r border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Boletas Recientes</h4>
              
              <div className="border rounded-lg max-h-[400px] overflow-y-auto flex-grow">
                {[1234, 1235, 1236, 1237].map((id) => (
                  <button
                    key={id}
                    onClick={() => setSelectedBoleta(id)}
                    className={`w-full flex items-center gap-3 p-3 text-left border-b last:border-b-0 transition-colors
                                ${selectedBoleta === id 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'text-gray-700 hover:bg-gray-100'
                                }`}
                  >
                    <BoletaIcon className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold block">Boleta n° {id}</span>
                      <span className="text-xs text-gray-500">01/01/2025 - 13:45</span>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex justify-center items-center gap-2 pt-4 text-sm mt-auto">
                <Link href="#" className="px-3 py-1 rounded bg-gray-200 text-gray-800 font-medium hover:bg-gray-300">1</Link>
                <Link href="#" className="px-3 py-1 rounded hover:bg-gray-100 text-gray-600">2</Link>
                <Link href="#" className="px-3 py-1 rounded hover:bg-gray-100 text-gray-600">3</Link>
                <span className="text-gray-500">...</span>
                <Link href="#" className="px-3 py-1 rounded hover:bg-gray-100 text-gray-600">68</Link>
              </div>
            </div>

            {/* --- COLUMNA 2: VISTA PREVIA --- */}
            <div className="px-4 mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Vista Previa (Boleta n° {selectedBoleta})</h4>
              <div className="border border-gray-200 rounded-lg p-4 bg-white h-full min-h-[400px] shadow-inner">
                <h5 className="font-bold text-lg">BOLETA</h5>
                <p className="text-sm text-gray-600 ">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                  eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                  ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                  aliquip ex ea commodo consequat. Duis aute irure dolor in
                  reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                  pariatur...
                </p>
              </div>
            </div>

            {/* --- COLUMNA 3: ACCIONES --- */}
            <div className="space-y-5 flex flex-col gap-4 pl-4 border-l border-gray-200">
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                <span className="text-sm font-medium text-gray-600">Cajero</span>
                <p className="text-xl font-semibold text-gray-900">Liam Ley</p>
              </div>
              
              <button className="w-full flex items-center justify-center gap-2 py-3 px-4
                                 bg-blue-600 text-white font-semibold rounded-lg shadow-sm
                                 hover:bg-blue-700 transition-colors">
                <PrintIcon className="w-5 h-5" />
                Imprimir Boleta
              </button>
              
              <button className="w-full flex items-center justify-center gap-2 py-3 px-4
                                 bg-white text-gray-700 font-semibold rounded-lg shadow-sm
                                 border border-gray-300 hover:bg-gray-50 transition-colors">
                <DownloadIcon className="w-5 h-5 text-gray-500" />
                Descargar PDF
              </button>

              <button className="w-full flex items-center justify-center gap-2 py-3 px-4
                                 bg-red-600 text-white font-semibold rounded-lg shadow-sm
                                 hover:bg-red-700 transition-colors">
                <AnularIcon className="w-5 h-5" />
                Anular Compra
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}