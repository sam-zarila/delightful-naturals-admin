"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface AdminUser {
  id: string
  name: string
  email: string
  role: "admin" | "super-admin"
}

interface AdminAuthContextType {
  admin: AdminUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

// Mock admin user for demonstration
const mockAdmin: AdminUser = {
  id: "admin-1",
  name: "Sister Lesley",
  email: "admin@delightfulnaturals.co.za",
  role: "super-admin",
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing admin session
    const savedAdmin = localStorage.getItem("delightful-naturals-admin")
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin))
      } catch (error) {
        console.error("Failed to parse saved admin:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock admin authentication - in real app, this would call your API
    if (email === "admin@delightfulnaturals.co.za" && password === "admin123") {
      setAdmin(mockAdmin)
      localStorage.setItem("delightful-naturals-admin", JSON.stringify(mockAdmin))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setAdmin(null)
    localStorage.removeItem("delightful-naturals-admin")
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
