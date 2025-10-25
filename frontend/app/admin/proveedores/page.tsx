"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Para la imagen placeholder

// --- Iconos para Proveedores ---
const ListBulletIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);
const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm16.5-1.5H3.75" />
  </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
  </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

export default function Page() {
  const [selectedSku, setSelectedSku] = useState("SK-1");
  const [selectedProvider, setSelectedProvider] = useState("Walmart");

  const proveedores = [
    { sku: "SK-1", nombre: "Walmart" },
    { sku: "SK-2", nombre: "Proveedor ABC" },
    { sku: "SK-3", nombre: "Distribuidora XYZ" },
    { sku: "SK-4", nombre: "Importadora Global" },
  ];

  const handleSelectProvider = (sku: string, nombre: string) => {
    setSelectedSku(sku);
    setSelectedProvider(nombre);
  };

  return (
    // Asumiendo que tu layout.tsx ya provee el fondo bg-gray-50 y el navbar/footer
    <main className="flex-grow p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Título de la Página */}
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
          Gestión de Proveedores
        </h2>

        {/* Contenedor Principal (Tarjeta Blanca) */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-8">
            
            {/* --- COLUMNA IZQUIERDA: Menú Lateral --- (md:col-span-2) */}
            <div className="md:col-span-2 space-y-3 pr-4 border-r border-gray-200">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Navegación</h4>
              <Link 
                href="/bodega/productos" // Ajusta esta ruta
                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <ListBulletIcon className="w-5 h-5" />
                <span className="font-medium">Lista Productos</span>
              </Link>
              <Link 
                href="/bodega/marcas" // Ajusta esta ruta
                className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <TagIcon className="w-5 h-5" />
                <span className="font-medium">Lista Marca</span>
              </Link>
              {/* Puedes añadir más enlaces aquí */}
            </div>

            {/* --- COLUMNA CENTRAL: Lista/Tabla de Proveedores --- (md:col-span-6) */}
            <div className="md:col-span-6">
              <div className="border rounded-lg overflow-hidden">
                {/* Encabezado de la tabla */}
                <div className="bg-gray-100 px-4 py-3 border-b">
                  <div className="grid grid-cols-3 font-semibold text-sm text-gray-600">
                    <span className="col-span-1">SKU</span>
                    <span className="col-span-2">Proveedor</span>
                  </div>
                </div>
                {/* Cuerpo de la tabla (Scrollable) */}
                <div className="max-h-[400px] overflow-y-auto">
                  {proveedores.map((prov) => (
                    <button
                      key={prov.sku}
                      onClick={() => handleSelectProvider(prov.sku, prov.nombre)}
                      className={`w-full px-4 py-3 border-b last:border-b-0 transition-colors ${
                        selectedSku === prov.sku ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="grid grid-cols-3 text-sm">
                        <span className={`col-span-1 font-medium ${selectedSku === prov.sku ? 'text-blue-700' : 'text-gray-900'}`}>{prov.sku}</span>
                        <span className={`col-span-2 ${selectedSku === prov.sku ? 'text-blue-700' : 'text-gray-700'}`}>{prov.nombre}</span>
                        {/* El icono LinkIcon está comentado como en el mockup, puedes añadirlo si lo necesitas */}
                        {/* <LinkIcon className="w-4 h-4 text-gray-400 justify-self-end" /> */}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Paginación (si es necesaria) */}
              {/* ... (añadir paginación similar a la de boletas si hay muchos proveedores) ... */}
            </div>

            {/* --- COLUMNA DERECHA: Acciones y Detalles --- (md:col-span-4) */}
            <div className="flex flex-col gap-4 md:col-span-4 space-y-5 pl-4 border-l border-gray-200">
              
              {/* Botón Buscar Proveedor */}
              <button className="w-full flex items-center justify-between py-3 px-4
                                 bg-white text-gray-700 font-semibold rounded-lg shadow-sm
                                 border border-gray-300 hover:bg-gray-50 transition-colors">
                <span>Buscar Proveedor</span>
                <SearchIcon className="w-5 h-5 text-gray-500" />
              </button>
              
              {/* Botón Agregar Proveedor */}
              <button className="w-full flex items-center justify-between py-3 px-4
                                 bg-blue-600 text-white font-semibold rounded-lg shadow-sm
                                 hover:bg-blue-700 transition-colors">
                <span>Agregar Proveedor</span>
                <PlusIcon className="w-5 h-5" />
              </button>

              {/* Placeholder de Imagen */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg aspect-square flex items-center justify-center">
                <PhotoIcon className="w-16 h-16 text-gray-300" />
              </div>

              {/* Detalles del Proveedor Seleccionado */}
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600">SKU: {selectedSku}</p>
                <p className="text-lg font-semibold text-gray-900">Nombre: {selectedProvider}</p>
                {/* Botones Modificar/Eliminar */}
                <div className="flex gap-3 mt-4">
                  <button className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold
                                     bg-gray-700 text-white rounded shadow-sm hover:bg-gray-800">
                    <PencilIcon className="w-3 h-3" />
                    Modificar
                  </button>
                  <button className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold
                                     bg-red-600 text-white rounded shadow-sm hover:bg-red-700">
                    <TrashIcon className="w-3 h-3" />
                    Eliminar
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