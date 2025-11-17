'use client'
import "toastify-js/src/toastify.css"
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { VentaTable, LineItem } from '@/components/ui/venta/VentaTable'
import { TableFooterSummary } from '@/components/ui/venta/VentaTableFooter'
import { CashierCard } from '@/components/ui/venta/VentaCashierCard'
import { SearchProductCard, SearchProductResult } from '@/components/ui/venta/VentaSearchProductCard'
import VentasPagosCard from '@/components/ui/venta/VentasPagosCard'
import PagarButton from '@/components/ui/venta/PagarButton'
import useUser from '@/components/hooks/useUser'
import Toastify from 'toastify-js'


const TAX_RATE = 0.19
const CURRENCY = 'CLP'

const INITIAL_CART: LineItem[] = []

export default function POSPreview() {
  const router = useRouter()
  const { data: session } = useSession()
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchProductResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [cartItems, setCartItems] = useState<LineItem[]>(INITIAL_CART)
  const [montoEfectivo, setMontoEfectivo] = useState<number>(0)
  const [montoTarjeta, setMontoTarjeta] = useState<number>(0)
  const cashierName = user?.nombre || (session?.user as any)?.name || 'Cajero'

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      setSearchError(null)
      setHasSearched(false)
    }
  }, [searchTerm])

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cartItems]
  )
  const discount = 0
  const taxable = Math.max(subtotal - discount, 0)
  const tax = Math.round(taxable * TAX_RATE)
  const total = taxable + tax

  const handleRemove = (id: LineItem['id']) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleClear = () => setCartItems([])

  const handleAddProduct = (product: Omit<LineItem, 'qty'>) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        const newQty = existing.qty + 1;
        if (newQty > product.stock) {
          Toastify({
            text: `No hay suficiente stock. Stock disponible: ${product.stock}`,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff9800",
            close: true
          }).showToast()
          return prev
        }

        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }

      if (product.stock <= 0) {
        Toastify({
          text: 'Producto sin stock disponible',
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "#ff9800",
          close: true
        }).showToast()
        return prev
      }

      return [...prev, { ...product, qty: 1 }]
    })
  }

  const handleIncrement = (id: LineItem['id']) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item

        const newQty = item.qty + 1
        if (newQty > item.stock) {
          Toastify({
            text: `No hay suficiente stock. Stock disponible: ${item.stock}`,
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff9800",
            close: true
          }).showToast()
          return item
        }

        return { ...item, qty: newQty }
      })
    )
  }

  const handleDecrement = (id: LineItem['id']) => {
    setCartItems((prev) =>
      prev.reduce<LineItem[]>((acc, item) => {
        if (item.id !== id) {
          acc.push(item)
          return acc
        }
        const nextQty = Math.max(item.qty - 1, 0)
        if (nextQty > 0) acc.push({ ...item, qty: nextQty })
        return acc
      }, [])
    )
  }

  const handleSearch = async () => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return

    setSearchLoading(true)
    setSearchError(null)
    setHasSearched(true)

    try {
      const response = await fetch('/api/productos', { cache: 'no-store' })
      if (!response.ok && response.status !== 404) {
        const body = await response.text()
        throw new Error(body || 'No se pudo obtener la lista de productos')
      }

      let productos: Producto[] = []

      if (response.ok) {
        const data = await response.json()
        console.log(data)
        productos = data ?? []
      }

      const filtered = productos
        .filter((product) => {
          const normalizedName = product.nombre.toLowerCase()
          return (
            product.sku.toLowerCase().includes(query) ||
            normalizedName.includes(query)
          )
        })
        .map<SearchProductResult>((product) => ({
          sku: product.sku,
          name: product.nombre,
          price: Number(product.precio_venta),
          stock: product.stock,
          gtin: product.gtin,
          precio_compra: product.precio_compra,
          categoria: product.categoria,
          marca: product.marca,
        }))

      setSearchResults(filtered)
    } catch (error) {
      let message = 'No se pudo buscar productos'
      if (error instanceof Error) {
        message = error.message
      }
      setSearchError(message)
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectSearchResult = (product: SearchProductResult) => {
    handleAddProduct({
      id: product.sku,
      sku: product.sku,
      name: product.name,
      price: product.price,
      gtin: product.gtin,
      precio_compra: product.precio_compra,
      stock: product.stock,
      categoria: product.categoria,
      marca: product.marca,
    })
    setSearchTerm('')
    setSearchResults([])
    setHasSearched(false)
  }

  // Envía una venta al endpoint POST /api/ventas
  const submitSale = async () => {
    if (!cartItems.length) return

    const monto_efectivo = Math.round(Number(montoEfectivo || 0))
    const monto_tarjeta = Math.round(Number(montoTarjeta || 0))

    const detalles = cartItems.map((item) => ({
      producto: {
        sku: item.sku,
        nombre: item.name,
        gtin: item.gtin,
        precio_venta: item.price,
        precio_compra: item.precio_compra,
        stock: item.stock,
        categoria: item.categoria,
        marca: item.marca,
      },
      cantidad: item.qty,
      subtotal: item.price * item.qty,
    }))

    const body = {
      total,
      monto_tarjeta,
      monto_efectivo,
      detalles,
    }

    try {
      const res = await fetch('/api/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const responseBody = await res.json().catch(() => ({}))

      if (!res.ok) {
        console.error('Error creating sale:', responseBody)

        const fieldErrors = responseBody?.error?.fieldErrors
        if (fieldErrors && typeof fieldErrors === 'object') {
          Object.entries(fieldErrors).forEach(([field, messages]) => {
            (messages as string[]).forEach(msg => {
              Toastify({
                text: `${field}: ${msg}`,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#ff0000",
                close: true
              }).showToast()
            })
          })
        } else {
          // mensaje genérico si no hay fieldErrors
          Toastify({
            text: responseBody?.errors || 'Error al crear la venta',
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#ff0000",
            close: true
          }).showToast()
        }
        return
      }
      // La venta ocurrio correctamente
      setCartItems([])


      Toastify({
        text: '¡Venta Ingresada Correctamente!',
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#00ff7f",
        close: true
      }).showToast()
      return

    } catch (err) {
      console.error('Error en submitSale:', err)
    }
  }
  return (
    <div className="mx-auto mt-[8rem] grid max-w-6xl grid-cols-12 gap-4 p-6">
      <div className="col-span-10 flex flex-col rounded-2xl border border-neutral-200 bg-white">
        <div className="flex-1 overflow-auto p-4 text-neutral-500">
          <VentaTable
            items={cartItems}
            currency={CURRENCY}
            onRemove={handleRemove}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        </div>
        <TableFooterSummary
          subtotal={subtotal}
          discount={discount}
          tax={tax}
          total={total}
          currency={CURRENCY}
        />
      </div>

      <div className="col-span-2 grid gap-4">

        <div className="grid grid-cols-2 gap-4">
          <CashierCard cashierName={cashierName} onClearCart={handleClear} />
          <PagarButton
            total={total}
            montoEfectivo={montoEfectivo}
            montoTarjeta={montoTarjeta}
            currency={CURRENCY}
            disabled={!cartItems.length}
            onPay={submitSale}
          />
        </div>

        <SearchProductCard
          value={searchTerm}
          onChange={setSearchTerm}
          onSearch={handleSearch}
          loading={searchLoading}
          error={searchError}
          results={searchResults}
          hasSearched={hasSearched}
          onSelectResult={handleSelectSearchResult}
        />

        <div className="grid gap-2">
          <VentasPagosCard
            onEfectivoChange={setMontoEfectivo}
            onTarjetaChange={setMontoTarjeta}
          />
        </div>
      </div>
    </div>
  )
}
