import type { Metadata } from "next"
import "./globals.css"
import NextAuthProvider from "../components/providers/NextAuthProvider"
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


export const metadata: Metadata = {
  title: "Stockly",
  description: "Inventory app"
}

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`antialiased ${inter.className}`}>
        <NextAuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
          
        </NextAuthProvider>
      </body>
    </html>
  )
}
