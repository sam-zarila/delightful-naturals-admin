"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCheckout } from "@/contexts/checkout-context"
import { CreditCard, Building, Banknote } from "lucide-react"

interface PaymentFormProps {
  onNext: () => void
  onBack: () => void
}

export function PaymentForm({ onNext, onBack }: PaymentFormProps) {
  const { state, updatePaymentMethod } = useCheckout()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  const isCardValid =
    state.paymentMethod.type !== "card" ||
    (state.paymentMethod.cardNumber &&
      state.paymentMethod.expiryDate &&
      state.paymentMethod.cvv &&
      state.paymentMethod.cardholderName)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup
            value={state.paymentMethod.type}
            onValueChange={(value) => updatePaymentMethod({ type: value as "card" | "eft" | "cash" })}
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer flex-1">
                <CreditCard className="h-5 w-5" />
                <span>Credit/Debit Card</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="eft" id="eft" />
              <Label htmlFor="eft" className="flex items-center space-x-2 cursor-pointer flex-1">
                <Building className="h-5 w-5" />
                <span>EFT/Bank Transfer</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center space-x-2 cursor-pointer flex-1">
                <Banknote className="h-5 w-5" />
                <span>Cash on Delivery</span>
              </Label>
            </div>
          </RadioGroup>

          {state.paymentMethod.type === "card" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <div>
                <Label htmlFor="cardholderName">Cardholder Name *</Label>
                <Input
                  id="cardholderName"
                  value={state.paymentMethod.cardholderName || ""}
                  onChange={(e) => updatePaymentMethod({ cardholderName: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  value={state.paymentMethod.cardNumber || ""}
                  onChange={(e) => updatePaymentMethod({ cardNumber: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    value={state.paymentMethod.expiryDate || ""}
                    onChange={(e) => updatePaymentMethod({ expiryDate: e.target.value })}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    value={state.paymentMethod.cvv || ""}
                    onChange={(e) => updatePaymentMethod({ cvv: e.target.value })}
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {state.paymentMethod.type === "eft" && (
            <div className="p-4 border rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">
                You will receive banking details via email after placing your order. Please allow 2-3 business days for
                payment processing.
              </p>
            </div>
          )}

          {state.paymentMethod.type === "cash" && (
            <div className="p-4 border rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">
                Pay with cash when your order is delivered. Additional delivery charges may apply.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={!isCardValid}>
              Review Order
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
