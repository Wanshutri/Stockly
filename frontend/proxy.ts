import { NextResponse, type NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || "clavesecretacambiar" as string

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Define las rutas públicas
  const publicPaths = ['/auth/login', '/auth/forgot-password']

  // Permitir el acceso a rutas públicas
  if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Si no hay token -> redirigir al login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    // Verificamos el token
    jwt.verify(token, SECRET_KEY)
    return NextResponse.next()
  } catch {
    // Token inválido o expirado -> redirigir
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}

// Aplica el middleware a las rutas protegidas
export const config = {
  matcher: ['/dashboard', '/bodega', '/admin/:path*'],
}
