"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface ShippingAddress {
  address: string
  city: string
  province: string
  postalCode: string
  country: string
}

export interface PaymentMethod {
  type: "card" | "eft" | "cash"
  cardNumber?: string
  expiryDate?: string
  cvv?: string
  cardholderName?: string
}

export interface CheckoutState {
  customerInfo: CustomerInfo
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  currentStep: number
}

interface CheckoutContextType {
  state: CheckoutState
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void
  updateShippingAddress: (address: Partial<ShippingAddress>) => void
  updatePaymentMethod: (payment: Partial<PaymentMethod>) => void
  setCurrentStep: (step: number) => void
  resetCheckout: () => void
}

const CheckoutContext = createContext<CheckoutContextType | null>(null)

const initialState: CheckoutState = {
  customerInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  shippingAddress: {
    address: "",
    city: "",
    province: "",
    postalCode: "",
    country: "South Africa",
  },
  paymentMethod: {
    type: "card",
  },
  currentStep: 1,
}

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CheckoutState>(initialState)

  const updateCustomerInfo = (info: Partial<CustomerInfo>) => {
    setState((prev) => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, ...info },
    }))
  }

  const updateShippingAddress = (address: Partial<ShippingAddress>) => {
    setState((prev) => ({
      ...prev,
      shippingAddress: { ...prev.shippingAddress, ...address },
    }))
  }

  const updatePaymentMethod = (payment: Partial<PaymentMethod>) => {
    setState((prev) => ({
      ...prev,
      paymentMethod: { ...prev.paymentMethod, ...payment },
    }))
  }

  const setCurrentStep = (step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }))
  }

  const resetCheckout = () => {
    setState(initialState)
  }

  return (
    <CheckoutContext.Provider
      value={{
        state,
        updateCustomerInfo,
        updateShippingAddress,
        updatePaymentMethod,
        setCurrentStep,
        resetCheckout,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  )
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (!context) {
    throw new Error("useCheckout must be used within a CheckoutProvider")
  }
  return context
}
