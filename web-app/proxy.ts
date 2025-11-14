import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/login",
  "/register",
  "/public",
];

// Admin SOLO con rutas exclusivas
const adminPaths = [
  "/admin",
  "/dashboard",
];

// Roles específicos
const vendedorPaths = [
  "/ventas",
  "/profile",
];

const bodegueroPaths = [
  "/bodega",
  "/profile",
];

export default withAuth({
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: ({ req, token }) => {
      const pathname = (req as NextRequest).nextUrl.pathname;

      if (publicPaths.some((path) => pathname.startsWith(path))) {
        return true;
      }

      if (!token) {
        return false;
      }

      const role = Number((token as any).role);

      // vendedor → rutas solo para vendedor y admin
      if (vendedorPaths.some((path) => pathname.startsWith(path))) {
        return role === 1 || role === 2;
      }

      // bodeguero → rutas solo para bodeguero y admin
      if (bodegueroPaths.some((path) => pathname.startsWith(path))) {
        return role === 1 || role === 3;
      }

      // admin → rutas exclusivas admin
      if (adminPaths.some((path) => pathname.startsWith(path))) {
        return role === 1;
      }

      // resto → acceso permitido
      return true;
    },
  },
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
