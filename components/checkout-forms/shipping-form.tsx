"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCheckout } from "@/contexts/checkout-context"

interface ShippingFormProps {
  onNext: () => void
  onBack: () => void
}

const southAfricanProvinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
]

export function ShippingForm({ onNext, onBack }: ShippingFormProps) {
  const { state, updateShippingAddress } = useCheckout()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const isValid =
    state.shippingAddress.address &&
    state.shippingAddress.city &&
    state.shippingAddress.province &&
    state.shippingAddress.postalCode

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Shipping Address</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={state.shippingAddress.address}
              onChange={(e) => updateShippingAddress({ address: e.target.value })}
              placeholder="123 Main Street"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={state.shippingAddress.city}
                onChange={(e) => updateShippingAddress({ city: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="province">Province *</Label>
              <Select
                value={state.shippingAddress.province}
                onValueChange={(value) => updateShippingAddress({ province: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province" />
                </SelectTrigger>
                <SelectContent>
                  {southAfricanProvinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={state.shippingAddress.postalCode}
                onChange={(e) => updateShippingAddress({ postalCode: e.target.value })}
                placeholder="0000"
                required
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value="South Africa" disabled />
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={!isValid}>
              Continue to Payment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
