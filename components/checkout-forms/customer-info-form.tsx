"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCheckout } from "@/contexts/checkout-context"

interface CustomerInfoFormProps {
  onNext: () => void
}

export function CustomerInfoForm({ onNext }: CustomerInfoFormProps) {
  const { state, updateCustomerInfo } = useCheckout()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const isValid =
    state.customerInfo.firstName && state.customerInfo.lastName && state.customerInfo.email && state.customerInfo.phone

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Customer Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={state.customerInfo.firstName}
                onChange={(e) => updateCustomerInfo({ firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={state.customerInfo.lastName}
                onChange={(e) => updateCustomerInfo({ lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={state.customerInfo.email}
              onChange={(e) => updateCustomerInfo({ email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={state.customerInfo.phone}
              onChange={(e) => updateCustomerInfo({ phone: e.target.value })}
              placeholder="+27 XX XXX XXXX"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={!isValid}>
            Continue to Shipping
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
