'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StocklyNavbar from '@/app/components/StocklyNavBar/StocklyNavbar'
import Link from 'next/link'

export default function AuthError({
  error = "Ocurrió un error durante la autenticación",
  showLogin = true
}: {
  error?: string
  showLogin?: boolean
}) {
  const router = useRouter()

  useEffect(() => {
    // Redirigir al login después de 5 segundos
    const timeout = setTimeout(() => {
      router.push('/auth/login')
    }, 5000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div>
      <header>
        <StocklyNavbar />
      </header>
      <main className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl">
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                Error de Autenticación
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {error}
              </p>
            </div>

            {showLogin && (
              <div className="mt-6">
                <p className="text-center text-sm text-gray-600">
                  Serás redirigido al login en 5 segundos.{' '}
                  <Link
                    href="/auth/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Ir al login ahora
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}