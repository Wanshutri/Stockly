import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET || "change-me-in-prod",
    debug: process.env.NODE_ENV === 'development',
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Stockly',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "ejemplo@stockly.cl" },
                password: { label: "Contraseña", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email y contraseña son requeridos')
                }

                try {
                    const URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                    const res = await fetch(`${URL}/api/usuarios/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    })
                    const data = await res.json()

                    if (!res.ok) {
                        throw new Error(data.message || 'Error de autenticación')
                    }

                    if (!data.token) {
                        throw new Error('Token no recibido del servidor')
                    }

                    // Decodificar el token JWT para obtener la información del usuario
                    const token = data.token
                    const base64Payload = token.split('.')[1]
                    const payload = JSON.parse(atob(base64Payload))

                    return {
                        id: payload.id_usuario.toString(),
                        token: data.token
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : 'Error de autenticación'
                    throw new Error(message)
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.accessToken = user.token
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id
            }
            return session
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60 // 8 hours
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
    }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }