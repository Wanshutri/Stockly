'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { VentaTable, LineItem } from '@/components/ui/VentaTable'
import { TableFooterSummary } from '@/components/ui/VentaTableFooter'
import { CashierCard } from '@/components/ui/VentaCashierCard'
import { SearchProductCard, SearchProductResult } from '@/components/ui/VentaSearchProductCard'
import { BigActionCard } from '@/components/ui/VentaBigActionCard'
import useUser from '@/components/hooks/useUser'
import type { ProductoType } from '@/types/db'
import PaymentIcon from '@mui/icons-material/Payment';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';

const TAX_RATE = 0.19
const CURRENCY = 'CLP'
const MOCK_CATALOG: Array<Omit<LineItem, 'qty'>> = [
  { id: 'T-SA123-A', sku: 'T-SA123-A', name: 'Leche Entera', price: 999 },
  { id: 'T-SA123-B', sku: 'T-SA123-B', name: 'Leche Descremada', price: 1099 },
  { id: 'C-AZ987-Z', sku: 'C-AZ987-Z', name: 'Azucar 1kg', price: 1490 },
]

const INITIAL_CART: LineItem[] = [
  { ...MOCK_CATALOG[0], qty: 2 },
  { ...MOCK_CATALOG[2], qty: 1 },
]

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
  const cashierName =
    user?.nombre || (session?.user as any)?.name || 'Cajero'

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
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const handleIncrement = (id: LineItem['id']) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
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

      let productos: ProductoType[] = []

      if (response.ok) {
        const data = await response.json()
        productos = data.productos ?? []
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
    })
    setSearchTerm('')
    setSearchResults([])
    setHasSearched(false)
  }

  const handlePay = () => {
    if (!cartItems.length) return
    router.push('/ventas/pagar')
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

          {/* Nueva card o botón a la derecha */}
          {/* <div className="rounded-xl bg-white p-4 shadow">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg">
              Nuevo botón
            </button>
          </div> */}
          <BigActionCard
            label=""
            amount={"Escanear Productos"}
            currency={""}

            disabled={false}
            icon={<CenterFocusWeakIcon />}
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
        <BigActionCard
          label="$ PAGAR"
          amount={total}
          currency={CURRENCY}
          onClick={handlePay}
          disabled={!cartItems.length}
          icon={<PaymentIcon />}
        />
      </div>
    </div>
  )
}
