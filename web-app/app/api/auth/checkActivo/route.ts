import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

const ALLOWLIST_ADMIN = ['/', '/admin', '/bodega', '/ventas', '/profile']
const ALLOWLIST_BODEGUERO = ['/', '/bodega', '/profile']
const ALLOWLIST_VENDEDOR = ['/', '/ventas', '/profile']

function getAllowedPathsByRole(id_tipo: number): string[] {
  switch (id_tipo) {
    case 1:
      return ALLOWLIST_ADMIN
    case 2:
      return ALLOWLIST_VENDEDOR
    case 3:
      return ALLOWLIST_BODEGUERO
    default:
      return []
  }
}

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token || !token.id) {
      return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    }

    const id = Number(token.id)
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: id },
      select: { id_usuario: true, activo: true, id_tipo: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    // obtener pathname del request actual (en cabecera personalizada del middleware)
    const urlHeader = req.headers.get('x-pathname') || '/'
    const allowedPaths = getAllowedPathsByRole(user.id_tipo)
    const canAccess = allowedPaths.some(
      (p) => urlHeader === p || urlHeader.startsWith(p + '/')
    )

    return NextResponse.json({
      activo: user.activo,
      id_usuario: user.id_usuario,
      id_tipo: user.id_tipo,
      canAccess
    })
  } catch (err) {
    console.error('checkActivo error', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
