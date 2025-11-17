import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import db from '../../../../lib/pg'

const ALLOWLIST_ADMIN = ['/', '/admin', '/profile', '/users']

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET })

    if (!token || !token.id) {
      return NextResponse.json({ error: 'not_authenticated' }, { status: 401 })
    }

    const id = Number(token.id)

    // --- CONSULTA SQL DIRECTA ---
    const query = 'SELECT id_usuario, activo, id_tipo FROM usuario WHERE id_usuario = $1'
    const result = await db.query(query, [id])

    // Si no hay filas, el usuario no existe
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 })
    }

    const user = result.rows[0]
    // ------------------------------------

    const urlHeader = req.headers.get('x-pathname') || '/'

    const canAccess = ALLOWLIST_ADMIN.some(
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