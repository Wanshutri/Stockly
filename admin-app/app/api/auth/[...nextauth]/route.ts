import NextAuth from 'next-auth/next'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { UsuarioType } from '@/types/db'
import { PrismaClient } from '@prisma/client/extension'

const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(
                credentials: Record<'email' | 'password', string> | undefined,
                req: any
            ) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error('Debes ingresar tu correo y contraseña')
                    }

                    const user: any = await (prisma as any).usuario.findUnique({
                        where: { email: credentials.email },
                    })

                    if (!user) throw new Error('El usuario no existe')
                    if (!user.password) throw new Error('Cuenta inválida (sin contraseña)')

                    const valid = await bcrypt.compare(credentials.password, user.password)
                    if (!valid) throw new Error('Contraseña incorrecta')
                    if (!user.activo) throw new Error('Cuenta deshabilitada.')

                    return { 
                        id: String(user.id_usuario),
                        name: user.nombre,
                        email: user.email,
                        id_tipo: user.id_tipo
                    }

                } catch (err: any) {
                    throw new Error(err.message || 'Error al iniciar sesión')
                }
            },
        }),
    ],
    session: { strategy: 'jwt' as const },
    pages: { signIn: '/login' },

    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id
                token.id_tipo = user.id_tipo
            }
            return token
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.id_tipo = token.id_tipo
            }
            return session
        },
    },
}

const handler = NextAuth(authOptions as any)

export { authOptions }
export { handler as GET, handler as POST }