// Types mirroring Prisma models for convenience and to avoid repeated literal objects
// These types are simple reflections of the Prisma model fields (useful for request/response shapes)

export type UsuarioType = {
  id_usuario: number
  nombre: string
  email: string
  password: string
  activo: boolean
  id_tipo: number
}

export type MarcaType = {
  id_marca: number
  nombre_marca: string
  productos?: ProductoType[]
}

export type TipoCategoriaType = {
  id_categoria: number
  nombre_categoria: string
  productos?: ProductoType[]
}

export type TipoUsuarioType = {
  id_tipo: number
  nombre_tipo: string
  usuarios?: UsuarioType[]
}

export type TipoDocumentoTributarioType = {
  codigo_sii: string
  nombre_tipo: string
  documentos?: DocumentoTributarioType[]
}

export type ProductoType = {
  sku: string
  nombre: string
  tipo_categoria: {
    id_categoria : number,
    nombre_categoria : string
  },
  tipo_marca: {
    id_marca : number,
    nombre_marca : string
  }
  precio_venta: number
  precio_compra: number
  descripcion: string
  stock: number
}

export type ClienteType = {
  id_cliente: number
  rut?: string | null
  nombre_completo?: string | null
  telefono?: string | null
  correo?: string | null
  es_anonimo: boolean
  compras?: CompraType[]
}

export type PagoType = {
  id_pago: number
  monto_efectivo: number
  monto_tarjeta: number
  compra?: CompraType
}

export type CompraType = {
  id_compra: number
  fecha: Date
  total: number
  id_cliente: number
  id_pago: number
  cliente?: ClienteType
  pago?: PagoType
  detalles_compra?: DetalleCompraType[]
  documento_tributario?: DocumentoTributarioType
}

export type DetalleCompraType = {
  sku: string
  id_compra: number
  cantidad: number
  subtotal: number
  producto?: ProductoType
  compra?: CompraType
}

export type DocumentoTributarioType = {
  id_documento: number
  id_compra: number
  id_tipo: string
  compra?: CompraType
  tipo_documento?: TipoDocumentoTributarioType
}
