import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import db from '../../../../lib/pg'
import { UsuarioType } from '@/types/db'; 

const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error('Debes ingresar tu correo y contraseña');
                    }

                    const query = 'SELECT * FROM usuario WHERE email = $1';
                    const result = await db.query(query, [credentials.email]);

                    if (result.rows.length === 0) {
                        throw new Error('El usuario no existe');
                    }

                    const user = result.rows[0] as UsuarioType;

                    if (!user.password) {
                        throw new Error('Cuenta inválida (sin contraseña)');
                    }

                    const valid = await bcrypt.compare(credentials.password, user.password);
                    
                    if (!valid) {
                        throw new Error('Contraseña incorrecta');
                    }

                    if (!user.activo) {
                        throw new Error('Cuenta deshabilitada, contacte a su administrador.');
                    }

                    return {
                        id: String(user.id_usuario),
                        name: user.nombre,
                        email: user.email,
                        id_tipo: user.id_tipo
                    };

                } catch (err: any) {
                    throw new Error(err.message || 'Error al iniciar sesión');
                }
            },
        }),
    ],
    session: { strategy: 'jwt' as const },
    pages: { signIn: '/login' },

    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.id_tipo = user.id_tipo;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.id_tipo = token.id_tipo as number;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions as any);

export { authOptions };
export { handler as GET, handler as POST };