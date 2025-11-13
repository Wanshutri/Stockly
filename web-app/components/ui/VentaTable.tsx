'use client'
import React from 'react'
import cn from '../hooks/cn'

const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })

export type LineItem = {
  id: string | number
  sku: string
  name: string
  price: number
  qty: number
}

export type POSTableProps = {
  items: LineItem[]
  currency?: string
  onRemove?: (id: LineItem['id']) => void
  onIncrement?: (id: LineItem['id']) => void
  onDecrement?: (id: LineItem['id']) => void
}

/**
 * Tabla de POS con encabezado gris y filas redondeadas (como en tu mockup).
 * - Cols: [btn, SKU, Producto, Precio, Cantidad, Total]
 */
export const VentaTable: React.FC<POSTableProps> = ({ items, currency = 'CLP', onRemove, onIncrement, onDecrement }) => {
  const fmt = currencyFormatter(currency)

  return (
    <div className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="grid grid-cols-12 items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3 text-white">
        <div className="col-span-1" />
        <div className="col-span-2 text-sm font-bold">SKU</div>
        <div className="col-span-3 text-sm font-bold">Producto</div>
        <div className="col-span-2 text-sm font-bold">Precio</div>
        <div className="col-span-2 text-sm font-bold">Cantidad</div>
        <div className="col-span-2 text-sm font-bold">Total</div>
      </div>

      {/* Rows */}
      <div className="mt-2 space-y-2 overflow-y-auto flex-1">
        {items.map((it) => (
          <div key={it.id} className="grid grid-cols-12 items-center gap-2 rounded-full bg-neutral-200 px-4 py-2 shadow-sm">
            {/* remove btn */}
            <div className="col-span-1 flex items-center">
              <button
                type="button"
                onClick={() => onRemove?.(it.id)}
                aria-label={`Eliminar ${it.name}`}
                className={cn(
                  'inline-grid h-8 w-8 place-content-center rounded-full border-2 border-neutral-600 text-neutral-800',
                  'hover:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400'
                )}
              >
                {/* X icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="col-span-2 text-sm font-semibold text-neutral-900">{it.sku}</div>
            <div className="col-span-3 text-sm font-semibold text-neutral-900">{it.name}</div>
            <div className="col-span-2 text-right text-sm font-extrabold text-neutral-900">{fmt.format(it.price)}</div>
            <div className="col-span-2 flex items-center justify-center gap-2 text-sm font-semibold">
              <button
                type="button"
                aria-label={`Disminuir ${it.name}`}
                onClick={() => onDecrement?.(it.id)}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 text-lg',
                  'hover:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400'
                )}
              >
                -
              </button>
              <span className="min-w-[1.5rem] text-center">{it.qty}</span>
              <button
                type="button"
                aria-label={`Incrementar ${it.name}`}
                onClick={() => onIncrement?.(it.id)}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-400 text-lg',
                  'hover:bg-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400'
                )}
              >
                +
              </button>
            </div>
            <div className="col-span-2 text-right text-sm font-extrabold text-neutral-900">{fmt.format(it.price * it.qty)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
