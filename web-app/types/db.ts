// ============================
// Types completos reflejando la respuesta real de Prisma
// ============================

// Marca
export type MarcaType = {
  id_marca: number;
  nombre_marca: string;
  productos?: ProductoType[];
};

// Categoría
export type TipoCategoriaType = {
  id_categoria: number;
  nombre_categoria: string;
  productos?: ProductoType[];
};

// Producto
export type ProductoType = {
  sku: string;
  nombre: string;
  id_categoria: number;
  id_marca: number;
  precio_venta: number;
  precio_compra: number;
  descripcion: string;
  stock: number;
  tipo_categoria: TipoCategoriaType;
  marca: MarcaType;
};

// Detalle de compra
export type DetalleCompraType = {
  sku: string;
  id_compra: number;
  cantidad: number;
  subtotal: number;
  producto?: ProductoType;
  compra?: CompraType;
};

// Tipo de documento tributario
export type TipoDocumentoTributarioType = {
  codigo_sii: string;
  nombre_tipo: string;
};

// Documento tributario
export type DocumentoTributarioType = {
  id_documento: number;
  id_compra: number;
  id_tipo: string;
  compra?: CompraType;
  tipo_documento?: TipoDocumentoTributarioType;
};

// Pago
export type PagoType = {
  id_pago: number;
  monto_efectivo: number;
  monto_tarjeta: number;
  compra?: CompraType;
};

// Cliente
export type ClienteType = {
  id_cliente: number;
  rut?: string | null;
  nombre_completo?: string | null;
  telefono?: string | null;
  correo?: string | null;
  es_anonimo: boolean;
  compras?: CompraType[];
};

// -----------------------------
// Compra (tipo principal / venta)
// -----------------------------
export type CompraType = {
  id_compra: number;
  fecha: string | Date; // puede ser string desde JSON
  total: number;
  id_pago: number;
  pago?: PagoType;
  detalles_compra?: DetalleCompraType[];
  documento_tributario?: DocumentoTributarioType;
};
