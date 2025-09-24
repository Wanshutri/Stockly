import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stockly",
  description: "PONER METADATOS ACA", // EDITAR METADATOS
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
