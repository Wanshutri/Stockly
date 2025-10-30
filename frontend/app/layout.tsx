import Navbar from "./components/StocklyNavBar/StocklyNavbar";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Stockly",
    default: "Stockly",
  },
  description:
    "Sistema web para gestionar inventarios, compras y ventas en tiempo real, con reportes automáticos y trazabilidad.",
  authors: [
    { name: "Felipe Andrade" },
    { name: "Ignacio Cordero" },
    { name: "Ariel Escobar" },
    { name: "Felipe Valenzuela" },
  ],
  keywords: [
    "Stockly", "gestión de inventario", "manejo de stock", "compras", "ventas", "reportes", "trazabilidad", "El Cubanito", "Node.js", "React", "PostgreSQL", "MongoDB",
  ],
  applicationName: "Stockly",
  openGraph: {
    title: "Stockly",
    description:
      "Gestión de inventario, compras y ventas para el almacén El Cubanito.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
