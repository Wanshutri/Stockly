import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";


type BackendUser = {
    id: string;
    email: string;
    name?: string;
    role?: string;
    token?: string;
};


export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials) return null;
                const { email, password } = credentials as {
                    email: string;
                    password: string;
                };


                const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });


                if (!res.ok) return null;


                const user = (await res.json()) as BackendUser;


                // debes adaptar la estructura devuelta por tu backend
                return {
                    id: user.id,
                    name: user.name ?? user.email,
                    email: user.email,
                    role: user.role,
                    token: user.token,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // cuando hay user (login inicial) añadimos datos al token
            if (user) {
                const u = user as BackendUser & { token?: string };
                if (u.id) token.sub = u.id;
                if (u.role) (token as any).role = u.role;
                if (u.token) (token as any).accessToken = u.token;
            }
            return token;
        },
        async session({ session, token }) {
            // enriquecemos la sesión con datos del token
            (session.user as any).id = token.sub;
            (session.user as any).role = (token as any).role;
            (session as any).accessToken = (token as any).accessToken;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
};


const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };