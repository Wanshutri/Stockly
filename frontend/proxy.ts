import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

interface Usuario {
  id: string;
  nombre?: string;
  activo?: boolean;
  [key: string]: any;
}

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token;
    if (!token) return NextResponse.redirect(new globalThis.URL('/auth/login', req.url));

    const API_URL = process.env.APP_URL || 'http://localhost:5000';
    let userData: Usuario | null = null;

    try {
      const res = await fetch(`${API_URL}/api/usuarios/${token.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`,
        },
      });

      if (res.ok) {
        userData = await res.json();
      } else {
        console.error('Error fetching user data:', res.status);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    }

    if (userData?.activo === false) {
      const loginUrl = new globalThis.URL('/auth/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/', '/bodega/:path*', '/admin/:path*', '/dashboards/:path*'],
};
