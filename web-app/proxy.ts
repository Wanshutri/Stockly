import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/login",
  "/register",
  "/public",
  "/api"
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

      // Leer `id_tipo` del token (preferido). Soportar `idTipo` y `role` como fallback.
      const rawRole = (token as any).id_tipo ?? (token as any).idTipo ?? (token as any).role;
      const role = Number(rawRole ?? -1);

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
