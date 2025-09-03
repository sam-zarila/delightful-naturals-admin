"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCheckout } from "@/contexts/checkout-context"
import { useCart } from "@/contexts/cart-context"
import Image from "next/image"

interface OrderReviewProps {
  onBack: () => void
  onPlaceOrder: () => void
}

export function OrderReview({ onBack, onPlaceOrder }: OrderReviewProps) {
  const { state } = useCheckout()
  const { state: cartState } = useCart()

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cartState.items.map((item) => (
              <div key={item.productId} className="flex items-center space-x-4">
                <Image
                  src={item.product.image || "/placeholder.svg"}
                  alt={item.product.name}
                  width={60}
                  height={60}
                  className="rounded-md object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.product.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.product.size} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">R{item.product.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer & Shipping Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Delivery Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Customer</h4>
            <p className="text-sm text-muted-foreground">
              {state.customerInfo.firstName} {state.customerInfo.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{state.customerInfo.email}</p>
            <p className="text-sm text-muted-foreground">{state.customerInfo.phone}</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium mb-2">Shipping Address</h4>
            <p className="text-sm text-muted-foreground">{state.shippingAddress.address}</p>
            <p className="text-sm text-muted-foreground">
              {state.shippingAddress.city}, {state.shippingAddress.province} {state.shippingAddress.postalCode}
            </p>
            <p className="text-sm text-muted-foreground">{state.shippingAddress.country}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment & Total */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Payment & Total</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Payment Method</h4>
            <p className="text-sm text-muted-foreground capitalize">
              {state.paymentMethod.type === "card"
                ? "Credit/Debit Card"
                : state.paymentMethod.type === "eft"
                  ? "EFT/Bank Transfer"
                  : "Cash on Delivery"}
            </p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>R{cartState.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">R{cartState.total}</span>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1 bg-transparent">
              Back
            </Button>
            <Button onClick={onPlaceOrder} className="flex-1">
              Place Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
