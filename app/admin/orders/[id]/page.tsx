"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, User, MapPin, CreditCard, Phone, Mail, Download, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface OrderDetailsPageProps {
  params: {
    id: string
  }
}

// Mock order data - in real app this would be fetched from database
const mockOrder = {
  id: "ORD001",
  customer: {
    name: "Thandiwe Mthembu",
    email: "thandiwe@example.com",
    phone: "+27 82 123 4567",
  },
  date: "2024-01-20",
  status: "processing",
  total: 560,
  subtotal: 560,
  shipping: 0,
  tax: 0,
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
  shippingAddress: {
    address: "123 Main Street",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2000",
    country: "South Africa",
  },
  billingAddress: {
    address: "123 Main Street",
    city: "Johannesburg",
    province: "Gauteng",
    postalCode: "2000",
    country: "South Africa",
  },
  paymentMethod: "card",
  trackingNumber: "TN123456789SA",
  notes: "Customer requested expedited shipping",
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "processing":
      return "bg-blue-100 text-blue-800"
    case "shipped":
      return "bg-purple-100 text-purple-800"
    case "delivered":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getPaymentMethodLabel(method: string) {
  switch (method) {
    case "card":
      return "Credit Card"
    case "eft":
      return "EFT Transfer"
    case "cod":
      return "Cash on Delivery"
    default:
      return method
  }
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const [orderStatus, setOrderStatus] = useState(mockOrder.status)

  const handleStatusUpdate = (newStatus: string) => {
    setOrderStatus(newStatus)
    // In real app, this would update the database
    console.log(`Updating order ${params.id} status to ${newStatus}`)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-charcoal">Order {mockOrder.id}</h1>
              <p className="text-muted-foreground">Placed on {mockOrder.date}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Print Invoice
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email Customer
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Order Status
                  <Badge className={getStatusColor(orderStatus)}>{orderStatus}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Select value={orderStatus} onValueChange={handleStatusUpdate}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {mockOrder.trackingNumber && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      Tracking: {mockOrder.trackingNumber}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="relative w-16 h-16">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.productName}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R{item.price * item.quantity}</p>
                        <p className="text-sm text-muted-foreground">R{item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {mockOrder.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{mockOrder.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{mockOrder.customer.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="h-4 w-4" />
                    {mockOrder.customer.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Phone className="h-4 w-4" />
                    {mockOrder.customer.phone}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <p>{mockOrder.shippingAddress.address}</p>
                  <p>
                    {mockOrder.shippingAddress.city}, {mockOrder.shippingAddress.province}
                  </p>
                  <p>{mockOrder.shippingAddress.postalCode}</p>
                  <p>{mockOrder.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Payment Method:</span>
                  <span>{getPaymentMethodLabel(mockOrder.paymentMethod)}</span>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R{mockOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>R{mockOrder.shipping}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>R{mockOrder.tax}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>R{mockOrder.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
