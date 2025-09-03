"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Download, Filter } from "lucide-react"
import Link from "next/link"

// Mock orders data - in real app this would come from database
const mockOrders = [
  {
    id: "ORD001",
    customer: {
      name: "Thandiwe Mthembu",
      email: "thandiwe@example.com",
      phone: "+27 82 123 4567",
    },
    date: "2024-01-20",
    status: "processing",
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
    shippingAddress: {
      address: "123 Main Street",
      city: "Johannesburg",
      province: "Gauteng",
      postalCode: "2000",
      country: "South Africa",
    },
    paymentMethod: "card",
  },
  {
    id: "ORD002",
    customer: {
      name: "Nomsa Dlamini",
      email: "nomsa@example.com",
      phone: "+27 83 456 7890",
    },
    date: "2024-01-19",
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
    shippingAddress: {
      address: "456 Oak Avenue",
      city: "Cape Town",
      province: "Western Cape",
      postalCode: "8000",
      country: "South Africa",
    },
    paymentMethod: "eft",
  },
  {
    id: "ORD003",
    customer: {
      name: "Lerato Molefe",
      email: "lerato@example.com",
      phone: "+27 84 789 0123",
    },
    date: "2024-01-18",
    status: "delivered",
    total: 260,
    items: [
      {
        productId: "2",
        productName: "Scalp Detox Oil",
        quantity: 1,
        price: 260,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shippingAddress: {
      address: "789 Pine Road",
      city: "Durban",
      province: "KwaZulu-Natal",
      postalCode: "4000",
      country: "South Africa",
    },
    paymentMethod: "cod",
  },
  {
    id: "ORD004",
    customer: {
      name: "Sipho Ndaba",
      email: "sipho@example.com",
      phone: "+27 85 012 3456",
    },
    date: "2024-01-17",
    status: "pending",
    total: 600,
    items: [
      {
        productId: "1",
        productName: "Mega Potent Hair Growth Oil",
        quantity: 2,
        price: 300,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shippingAddress: {
      address: "321 Elm Street",
      city: "Pretoria",
      province: "Gauteng",
      postalCode: "0001",
      country: "South Africa",
    },
    paymentMethod: "card",
  },
  {
    id: "ORD005",
    customer: {
      name: "Zinhle Khumalo",
      email: "zinhle@example.com",
      phone: "+27 86 345 6789",
    },
    date: "2024-01-16",
    status: "cancelled",
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
    shippingAddress: {
      address: "654 Birch Lane",
      city: "Port Elizabeth",
      province: "Eastern Cape",
      postalCode: "6000",
      country: "South Africa",
    },
    paymentMethod: "eft",
  },
]

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

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const orderStats = {
    total: mockOrders.length,
    pending: mockOrders.filter((o) => o.status === "pending").length,
    processing: mockOrders.filter((o) => o.status === "processing").length,
    shipped: mockOrders.filter((o) => o.status === "shipped").length,
    delivered: mockOrders.filter((o) => o.status === "delivered").length,
    cancelled: mockOrders.filter((o) => o.status === "cancelled").length,
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Orders</h1>
            <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Orders
          </Button>
        </div>

        {/* Order Stats */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{orderStats.total}</div>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{orderStats.processing}</div>
              <p className="text-xs text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{orderStats.shipped}</div>
              <p className="text-xs text-muted-foreground">Shipped</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{orderStats.delivered}</div>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search orders, customers, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
            <CardDescription>Recent customer orders and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      <Badge variant="outline">{getPaymentMethodLabel(order.paymentMethod)}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{order.date}</span>
                      <span>•</span>
                      <span>
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </span>
                      <span>•</span>
                      <span>
                        {order.shippingAddress.city}, {order.shippingAddress.province}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">R{order.total}</p>
                      <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No orders found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
