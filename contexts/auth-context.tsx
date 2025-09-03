"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  addresses: Address[]
  orders: Order[]
}

export interface Address {
  id: string
  type: "shipping" | "billing"
  address: string
  city: string
  province: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface Order {
  id: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: OrderItem[]
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
  image: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  addAddress: (address: Omit<Address, "id">) => void
  updateAddress: (id: string, address: Partial<Address>) => void
  deleteAddress: (id: string) => void
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
}

const AuthContext = createContext<AuthContextType | null>(null)

// Mock user data for demonstration
const mockUser: User = {
  id: "1",
  firstName: "Thandiwe",
  lastName: "Mthembu",
  email: "thandiwe@example.com",
  phone: "+27 82 123 4567",
  addresses: [
    {
      id: "1",
      type: "shipping",
      address: "123 Main Street",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2000",
      country: "South Africa",
      isDefault: true,
    },
  ],
  orders: [
    {
      id: "ORD001",
      date: "2024-01-15",
      status: "delivered",
      total: 560,
      items: [
        {
          productId: "1",
          productName: "Mega Potent Hair Growth Oil",
          quantity: 1,
          price: 300,
          image: "/placeholder.svg?height=80&width=80",
        },
        {
          productId: "2",
          productName: "Scalp Detox Oil",
          quantity: 1,
          price: 260,
          image: "/placeholder.svg?height=80&width=80",
        },
      ],
    },
    {
      id: "ORD002",
      date: "2024-02-20",
      status: "shipped",
      total: 300,
      items: [
        {
          productId: "1",
          productName: "Mega Potent Hair Growth Oil",
          quantity: 1,
          price: 300,
          image: "/placeholder.svg?height=80&width=80",
        },
      ],
    },
  ],
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("delightful-naturals-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Failed to parse saved user:", error)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication - in real app, this would call your API
    if (email === "thandiwe@example.com" && password === "password") {
      setUser(mockUser)
      localStorage.setItem("delightful-naturals-user", JSON.stringify(mockUser))
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock registration - in real app, this would call your API
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      addresses: [],
      orders: [],
    }

    setUser(newUser)
    localStorage.setItem("delightful-naturals-user", JSON.stringify(newUser))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("delightful-naturals-user")
  }

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)
      localStorage.setItem("delightful-naturals-user", JSON.stringify(updatedUser))
    }
  }

  const addAddress = (address: Omit<Address, "id">) => {
    if (user) {
      const newAddress: Address = {
        ...address,
        id: Math.random().toString(36).substr(2, 9),
      }
      const updatedUser = {
        ...user,
        addresses: [...user.addresses, newAddress],
      }
      setUser(updatedUser)
      localStorage.setItem("delightful-naturals-user", JSON.stringify(updatedUser))
    }
  }

  const updateAddress = (id: string, addressData: Partial<Address>) => {
    if (user) {
      const updatedUser = {
        ...user,
        addresses: user.addresses.map((addr) => (addr.id === id ? { ...addr, ...addressData } : addr)),
      }
      setUser(updatedUser)
      localStorage.setItem("delightful-naturals-user", JSON.stringify(updatedUser))
    }
  }

  const deleteAddress = (id: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        addresses: user.addresses.filter((addr) => addr.id !== id),
      }
      setUser(updatedUser)
      localStorage.setItem("delightful-naturals-user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
