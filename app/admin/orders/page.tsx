"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Download, Filter, RefreshCw } from "lucide-react"
import Link from "next/link"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { firestore } from "@/lib/firebase-client"

type Product = {
  id: string;
  name: string;
  price: number; // ZAR
  currency: 'R';
  img: string;
};

const CATALOG: Record<string, Product> = {
  'growth-100': {
    id: 'growth-100',
    name: 'Hair Growth Oil · 100ml',
    price: 300,
    currency: 'R',
    img: '/products/hair-growth-oil-100ml.png',
  },
  'detox-60': {
    id: 'detox-60',
    name: 'Scalp Detox Oil · 60ml',
    price: 260,
    currency: 'R',
    img: '/products/scalp-detox-oil-60ml.png',
  },
};

type OrderData = {
  customer: {
    name: string;
    email: string;
    phone?: string;
    shipping: 'courier' | 'pickup';
    address?: {
      city: string;
      province: string;
      line1: string;
      line2?: string;
      postalCode: string;
    };
    notes?: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    qty: number;
    lineTotal: number;
  }>;
  totals: {
    subtotal: number;
    shipping: number;
    grandTotal: number;
  };
  status: string;
  createdAt: any; // Timestamp, Date, string, or number
};

type Order = {
  id: string
  customer: { name: string; email: string; phone?: string }
  date?: string
  status?: string
  total: number
  items: Array<{ productId?: string; productName?: string; quantity: number; price: number; image?: string }>
  shippingAddress: { city?: string; province?: string }
  shipping: 'courier' | 'pickup'
  paymentMethod?: string
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
    case "paystack":
      return "Paystack"
    default:
      return method
  }
}

// Helper function to safely parse dates from Firestore
function parseFirestoreDate(dateValue: any): Date {
  if (!dateValue) {
    return new Date();
  }
  
  // If it's a Firestore Timestamp (has toDate method)
  if (typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's a string or number, try to parse it
  try {
    return new Date(dateValue);
  } catch (error) {
    console.warn('Failed to parse date:', dateValue, error);
    return new Date();
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

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const ordersRef = collection(firestore, 'orders')
      const q = query(ordersRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const mapped: Order[] = snapshot.docs.map((doc) => {
        const data = doc.data() as OrderData
        const id = doc.id
        const customer = data.customer
        const items = data.items.map((it) => ({
          productId: it.id,
          productName: it.name,
          quantity: it.qty,
          price: it.price,
          image: CATALOG[it.id]?.img || '/placeholder.svg?height=80&width=80',
        }))

        const shippingAddress = customer.shipping === 'courier' && customer.address ? {
          city: customer.address.city,
          province: customer.address.province,
        } : { city: undefined, province: undefined }

        // Use the safe date parser instead of direct toDate() call
        const orderDate = parseFirestoreDate(data.createdAt)

        return {
          id,
          customer: { 
            name: customer.name, 
            email: customer.email, 
            phone: customer.phone 
          },
          date: orderDate.toLocaleDateString(),
          status: data.status || 'pending',
          total: data.totals?.grandTotal || 0,
          items,
          shippingAddress,
          shipping: customer.shipping,
          paymentMethod: 'paystack',
        }
      })
      setOrders(mapped)
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchOrders} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Orders
            </Button>
          </div>
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

            {!loading && !error && (
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
                        <Badge className={getStatusColor(order.status ?? "")}>
                          {order.status ?? "unknown"}
                        </Badge>
                        <Badge variant="outline">
                          {getPaymentMethodLabel(order.paymentMethod ?? "")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{order.date}</span>
                        <span>•</span>
                        <span>
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </span>
                        <span>•</span>
                        <span>
                          {order.shipping === 'pickup' 
                            ? 'Pickup' 
                            : `${order.shippingAddress.city || 'N/A'}, ${order.shippingAddress.province || 'N/A'}`
                          }
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">R{order.total.toLocaleString()}</p>
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
            )}

            {filteredOrders.length === 0 && !loading && !error && (
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