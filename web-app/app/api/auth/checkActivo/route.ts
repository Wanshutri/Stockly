import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })
    if (!token || !token.id) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })

    const id = Number(token.id)
    const user = await prisma.usuario.findUnique({ where: { id_usuario: id } })
    if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 })

    return NextResponse.json({ activo: user.activo, id_usuario: user.id_usuario })
  } catch (err) {
    console.error('checkActivo error', err)
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
