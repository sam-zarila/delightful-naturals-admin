"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Download, Filter } from "lucide-react"
import Link from "next/link"

// API-backed orders state
type ApiOrder = {
  order_id: string
  total: number
  subtotal?: number
  shipping?: number
  delivery_method?: string
  payment_status?: string
  payment_provider?: string
  created_at?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  items?: Array<{ quantity: number; price: number; name?: string; volume?: string; image_url?: string }>
}

type Order = {
  id: string
  customer: { name: string; email: string; phone?: string }
  date?: string
  status?: string
  total: number
  items: Array<{ productId?: string; productName?: string; quantity: number; price: number; image?: string }>
  shippingAddress: { city?: string; province?: string }
  paymentMethod?: string
}

const API_ENDPOINT = process.env.NEXT_PUBLIC_ORDERS_API || "http://localhost/delightful/orders.php"

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

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.trim().toLowerCase()
    const matchesSearch =
      term === "" ||
      order.id.toLowerCase().includes(term) ||
      order.customer.name.toLowerCase().includes(term) ||
      order.customer.email.toLowerCase().includes(term)

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const orderStats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  }

  useEffect(() => {
    let mounted = true
    async function fetchOrders() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(API_ENDPOINT)
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const data: ApiOrder[] = await res.json()

        const mapped: Order[] = data.map((a) => {
          const id = a.order_id ?? String(Math.random()).slice(2, 8)
          const customerName = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim() || (a.email ?? "Unknown")
          const items = (a.items ?? []).map((it) => ({
            productId: undefined,
            productName: it.name ?? it.volume ?? "Product",
            quantity: it.quantity ?? 1,
            price: it.price ?? 0,
            image: it.image_url ?? "/placeholder.svg?height=80&width=80",
          }))

          return {
            id,
            customer: { name: customerName, email: a.email ?? "", phone: a.phone },
            date: a.created_at ?? undefined,
            status: (a.payment_status ?? "pending").toLowerCase(),
            total: a.total ?? 0,
            items,
            shippingAddress: { city: undefined, province: undefined },
            paymentMethod: (a.payment_provider ?? "unknown").toLowerCase(),
          }
        })

        if (mounted) setOrders(mapped)
      } catch (err: any) {
        if (mounted) setError(err.message || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchOrders()
    return () => {
      mounted = false
    }
  }, [])

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
            {loading && (
              <div className="text-center py-8">Loading orders...</div>
            )}

            {error && (
              <div className="text-center py-8 text-red-600">Error loading orders: {error}</div>
            )}

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
                      <Badge className={getStatusColor(order.status ?? "")}>{order.status ?? "unknown"}</Badge>
                      <Badge variant="outline">{getPaymentMethodLabel(order.paymentMethod ?? "")}</Badge>
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
