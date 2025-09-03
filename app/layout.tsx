"use client"

import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { AdminAuthProvider } from "@/contexts/admin-auth-context"
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans",
})



export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (pathname !== '/admin/dashboard') {
      router.replace('/admin/dashboard')
    }
  }, [pathname, router])


  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>{children}</CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
