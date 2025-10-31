'use client'

// Importaciones de componentes
import { useState, useMemo } from 'react'; // ¡Importar useMemo!
import StocklySmallButton from "@/app/components/StocklySmallButton/StockyButton";
import StocklyDataList from "@/app/components/StocklyList/StocklyDataList";
import StocklyDataListItem from "@/app/components/StockyListItem/StocklyDataListItem";
import StocklyLargeButtonCard from "@/app/components/StoclyLargeButtonCard/StoclyLargeButtonCard";


// Importaciones de iconos
import { Search, Plus, List, Tag, MoreVertical, Boxes, Database, Upload } from "lucide-react";
import StocklyNavbar from '../components/StocklyNavBar/StocklyNavbar';
import StocklyFooter from '../components/StocklyFooter/StocklyFooter';

// --- Constantes ---

// Columnas y datos de PRODUCTOS
const INVENTORY_COLUMNS_LG = ["SKU", "Producto", "Categoría", "Marca", "Stock", "Estado", ""];
const PRODUCT_DATA = [
  { id: 1, sku: "SK-1001", product: "Leche Entera UHT", category: "Lácteos", brand: "Colun", stock: "0", status: "Sin Stock", statusColor: "red" },
  { id: 2, sku: "SK-1002", product: "Bebida Cola Light 2L", category: "Bebidas", brand: "Coca-Cola", stock: "20+", status: "Stock Alto", statusColor: "green" },
  { id: 3, sku: "SK-1003", product: "Pan Integral Molde", category: "Panadería", brand: "Ideal", stock: "2-5", status: "Poco Stock", statusColor: "yellow" },
  { id: 4, sku: "SK-1004", product: "Aceite de Oliva Extra", category: "Aceites", brand: "Olisur", stock: "10-20", status: "Stock Normal", statusColor: "blue" },
  { id: 5, sku: "SK-1005", product: "Detergente Líquido", category: "Limpieza", brand: "Omo", stock: "20+", status: "Stock Alto", statusColor: "green" },
  { id: 6, sku: "SK-1006", product: "Mermelada de Damasco", category: "Abarrotes", brand: "Selecta", stock: "2-5", status: "Poco Stock", statusColor: "yellow" },
];

// Columnas y datos de MARCAS
const BRANDS_COLUMNS = ["ID", "Marca", "Total Productos", "Último Agregado", ""];
const BRAND_DATA = [
  { id: 101, label: "Colun", totalProducts: 12, lastAdded: "2024-10-20" },
  { id: 102, label: "Coca-Cola", totalProducts: 5, lastAdded: "2024-10-15" },
  { id: 103, label: "Ideal", totalProducts: 8, lastAdded: "2024-10-01" },
  { id: 104, label: "Omo", totalProducts: 20, lastAdded: "2024-10-25" },
];

// Columnas y datos de CATEGORÍAS
const CATEGORIES_COLUMNS = ["ID", "Categoría", "SKUs Distintos", "Stock Total", ""];
const CATEGORY_DATA = [
  { id: 201, label: "Lácteos", distinctSkus: 15, totalStock: 800 },
  { id: 202, label: "Bebidas", distinctSkus: 8, totalStock: 450 },
  { id: 203, label: "Limpieza", distinctSkus: 20, totalStock: 1200 },
];

// NAV_ITEMS con viewId para el manejo de estado
const NAV_ITEMS = [
  { label: "Productos", icon: List, viewId: 'products' },
  { label: "Marcas", icon: Tag, viewId: 'brands' },
  { label: "Categorias", icon: Boxes, viewId: 'categories' },
];


// Componente de la página principal
export default function InventoryPage() {
  // Estado para rastrear qué vista (tab) está activa. Por defecto: 'products'
  const [activeView, setActiveView] = useState('products');
  // Estado **NUEVO** para el término de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusStyle = (color: string) => {
    switch (color) {
      case 'red': return "bg-red-100 text-red-800";
      case 'yellow': return "bg-yellow-100 text-yellow-800";
      case 'green': return "bg-green-100 text-green-800";
      case 'blue': return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // --- LÓGICA DE FILTRADO DE DATOS (useMemo para optimización) ---
  const filteredData = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    if (!searchTerm) {
      // Si no hay término de búsqueda, devuelve los datos completos de la vista activa
      switch (activeView) {
        case 'brands': return BRAND_DATA;
        case 'categories': return CATEGORY_DATA;
        default: return PRODUCT_DATA;
      }
    }

    // Filtra los datos según la vista activa
    switch (activeView) {
      case 'brands':
        return BRAND_DATA.filter(item =>
          item.label.toLowerCase().includes(lowerCaseSearchTerm) ||
          String(item.id).includes(lowerCaseSearchTerm)
        );
      case 'categories':
        return CATEGORY_DATA.filter(item =>
          item.label.toLowerCase().includes(lowerCaseSearchTerm) ||
          String(item.id).includes(lowerCaseSearchTerm)
        );
      case 'products':
      default:
        return PRODUCT_DATA.filter(item =>
          item.product.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.sku.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.brand.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.category.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }
  }, [activeView, searchTerm]); // Se recalcula si la vista o el término de búsqueda cambian
  // -----------------------------------------------------------------

  /**
   * Obtiene dinámicamente el título, las columnas y los datos 
   * a renderizar en la tabla principal según la vista activa.
   */
  const getTableViewData = () => {
    // **Usamos los datos filtrados (filteredData) en lugar de los originales**
    const currentData = filteredData;

    switch (activeView) {
      case 'brands':
        return {
          title: `Lista de Marcas (${currentData.length})`, // Título dinámico con conteo
          columns: BRANDS_COLUMNS,
          data: currentData, // Usamos currentData (filtrado)
          renderItem: (item: any) => ([
            item.id,
            item.label,
            <span key="total" className="font-semibold text-gray-800">{item.totalProducts}</span>,
            item.lastAdded,
            <button key="more" className="justify-self-end text-gray-500 hover:text-indigo-600 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition duration-150">
              <MoreVertical className="h-4 w-4" />
            </button>,
          ]),
        };
      case 'categories':
        return {
          title: `Lista de Categorías (${currentData.length})`, // Título dinámico con conteo
          columns: CATEGORIES_COLUMNS,
          data: currentData, // Usamos currentData (filtrado)
          renderItem: (item: any) => ([
            item.id,
            item.label,
            <span key="distinct" className="font-semibold text-blue-600">{item.distinctSkus}</span>,
            <span key="stock" className="font-semibold text-indigo-600">{item.totalStock} unidades</span>,
            <button key="more" className="justify-self-end text-gray-500 hover:text-indigo-600 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition duration-150">
              <MoreVertical className="h-4 w-4" />
            </button>,
          ]),
        };
      case 'products':
      default:
        return {
          title: `Lista de Productos (${currentData.length})`, // Título dinámico con conteo
          columns: INVENTORY_COLUMNS_LG,
          data: currentData, // Usamos currentData (filtrado)
          renderItem: (item: any) => ([
            item.sku,
            item.product,
            <span key="category" className="hidden md:inline">{item.category}</span>,
            <span key="brand" className="hidden md:inline">{item.brand}</span>,
            <span key="stock" className={`font-semibold ${item.stock === '0' ? 'text-red-600' : item.stock.includes('20+') ? 'text-green-600' : 'text-yellow-600'}`}>{item.stock}</span>,
            <span key="status" className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(item.statusColor)}`}>
              {item.status}
            </span>,
            <button key="more" className="justify-self-end text-gray-500 hover:text-indigo-600 cursor-pointer p-1 rounded-full hover:bg-gray-100 transition duration-150">
              <MoreVertical className="h-4 w-4" />
            </button>,
          ]),
        };
    }
  };

  const { title, columns, data, renderItem } = getTableViewData(); // Obtiene el set de datos actual (¡ya filtrado!)

  return (
    <div>
      <header>
        <StocklyNavbar />
      </header>
      <main>
        <div className="p-5 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex justify-between items-start sm:items-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
              {/* Botón de acción primaria: Agregar Nuevo Producto */}
              <button className="inline-flex items-center cursor-pointer rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-medium text-white shadow-md hover:bg-indigo-700 transition duration-150">
                <Plus className="h-5 w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Crear {activeView === 'products' ? 'Producto' : activeView === 'brands' ? 'Marca' : 'Categoría'}</span> {/* Se ajusta el texto */}
              </button>
            </div>

            {/* Barra de Búsqueda Global y Vistas (Ahora horizontal) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              {/* Búsqueda Principal - MODIFICADO */}
              <div className="relative rounded-lg shadow-sm w-full md:w-2/3">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="search"
                  className="block w-full rounded-lg border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder={`Buscar en ${title}...`}
                  value={searchTerm} // Vincula el valor al estado
                  onChange={(e) => setSearchTerm(e.target.value)} // Actualiza el estado al escribir
                />
              </div>
              {/* Vistas (Botones que cambian el contenido de la tabla) */}
              <div className="flex flex-row gap-2 overflow-x-auto pb-1 md:w-1/3 md:justify-end mb-4">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <StocklySmallButton
                      key={item.viewId}
                      label={item.label}
                      icon={<Icon className="h-4 w-4" />}
                      active={item.viewId === activeView}
                      onClick={() => {
                        setActiveView(item.viewId); // Cambia la vista
                        setSearchTerm(''); // **NUEVO: Limpia el buscador al cambiar de pestaña**
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* 2. --- ESTRUCTURA PRINCIPAL DE 2 COLUMNAS --- */}
            <div className="grid grid-cols-12 gap-6">

              {/* COLUMNA 1: LISTA DINÁMICA DE DATOS */}
              <div className="col-span-12 lg:col-span-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">{title}</h2> {/* TÍTULO DINÁMICO */}
                <div className="bg-white shadow-xl rounded-xl overflow-x-auto ring-1 ring-gray-200">
                  <StocklyDataList columns={columns}>
                    {/* COLUMNAS DINÁMICAS */}
                    {data.length > 0 ? (
                      data.map((item) => (
                        // DATOS DINÁMICOS
                        <StocklyDataListItem
                          key={item.id}
                          selected={item.id === 1 && activeView === 'products' && !searchTerm} // Ajuste para selección por defecto
                          cells={renderItem(item)} // CELDAS DINÁMICAS
                        />
                      ))
                    ) : (
                      // Mensaje si no hay resultados
                      <div className="p-4 text-center text-gray-500">
                        No se encontraron resultados para "{searchTerm}" en {activeView}.
                      </div>
                    )}
                  </StocklyDataList>

                </div>
              </div>

              {/* COLUMNA 2: ACCIONES Y DETALLE */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-0 hidden lg:block">Acciones y Detalle Rápido</h2>

                {/* Panel de Acciones Rápidas */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Acciones Masivas</h3>
                  <StocklyLargeButtonCard
                    title="Cargar Masivamente"
                    icon={<Upload className="h-6 w-6 text-green-600" />}
                  />
                  <StocklyLargeButtonCard
                    title="Generar Reporte"
                    icon={<Database className="h-6 w-6 text-indigo-600" />}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <StocklyFooter />
      </footer>
    </div>
  );
}