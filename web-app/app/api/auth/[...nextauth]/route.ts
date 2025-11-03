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
                    // Validaciones básicas de entrada
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error('Debes ingresar tu correo y contraseña')
                    }

                    const user: UsuarioType = await (prisma as PrismaClient).usuario.findUnique({
                        where: { email: credentials.email },
                    })

                    if (!user) {
                        throw new Error('El usuario no existe')
                    }

                    if (!user.password) {
                        throw new Error('Cuenta inválida (sin contraseña)')
                    }
                    const valid = await bcrypt.compare(credentials.password, user.password)
                    
                    if (!valid) {
                        throw new Error('Contraseña incorrecta')
                    }

                    // Si todo está bien, devuelve sólo el id del usuario (guardaremos solo el id en la sesión)
                    return { id: String(user.id_usuario) }

                } catch (err: any) {
                    // Si hay error, lo lanzamos para que NextAuth lo capture y lo muestre
                    throw new Error(err.message || 'Error al iniciar sesión')
                }
            },
        }),
    ],
    session: { strategy: 'jwt' },
    pages: { signIn: '/login' },

    callbacks: {
    async jwt({ token, user }: any) {
            if (user) {
                return {
                    ...token,
                    id: (user as any).id
                }
            }
            return token
        },
    async session({ session, token }: any) {
            if (session.user) {
                session.user = { id: token.id as string }
            }
            return session
        },
    },
}

const handler = NextAuth(authOptions as any)

export { authOptions }
export { handler as GET, handler as POST }
