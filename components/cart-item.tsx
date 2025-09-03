"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, Minus } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import type { CartItem } from "@/contexts/cart-context"

interface CartItemProps {
  item: CartItem
}

export function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(item.productId, newQuantity)
    }
  }

  const handleRemove = () => {
    removeItem(item.productId)
  }

  return (
    <div className="flex items-center space-x-4 py-4 border-b">
      <div className="flex-shrink-0">
        <Image
          src={item.product.image || "/placeholder.svg"}
          alt={item.product.name}
          width={80}
          height={80}
          className="rounded-md object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-lg font-semibold text-foreground">{item.product.name}</h3>
        <p className="text-sm text-muted-foreground">{item.product.size}</p>
        <p className="text-lg font-bold text-primary">R{item.product.price}</p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
          className="w-16 text-center"
          min="1"
        />
        <Button variant="outline" size="sm" onClick={() => handleQuantityChange(item.quantity + 1)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-right">
        <p className="font-bold text-lg">R{item.product.price * item.quantity}</p>
        <Button variant="ghost" size="sm" onClick={handleRemove} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
