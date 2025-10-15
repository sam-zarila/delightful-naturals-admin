"use client"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  Edit,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { fetchCustomerById } from "@/lib/api"

interface CustomerDetailsPageProps {
  params: {
    id: string
  }
}

const blank = {
  id: null,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  joinDate: "",
  totalOrders: 0,
  totalSpent: 0,
  lastOrderDate: "",
  status: "",
  addresses: [],
  orders: [],
  notes: "",
}

function getCustomerTier(totalSpent: number) {
  if (totalSpent >= 1000) return { tier: "VIP", color: "bg-purple-100 text-purple-800" }
  if (totalSpent >= 500) return { tier: "Gold", color: "bg-yellow-100 text-yellow-800" }
  if (totalSpent >= 200) return { tier: "Silver", color: "bg-gray-100 text-gray-800" }
  return { tier: "Bronze", color: "bg-orange-100 text-orange-800" }
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

export default function CustomerDetailsPage({ params }: CustomerDetailsPageProps) {
  const [customer, setCustomer] = useState<any>(blank)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    fetchCustomerById(params.id)
      .then((data) => {
        if (!mounted) return
        // normalize fields from PHP API
        if (!data || data.message === "Customer not found") {
          setError("Customer not found")
          return
        }

        const c = {
          id: data.id || data.ID || params.id,
          firstName: data.first_name || data.firstName || "",
          lastName: data.last_name || data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          joinDate: data.join_date || data.joinDate || "",
          totalOrders: Number(data.total_orders || data.totalOrders || 0),
          totalSpent: Number(data.total_spent || data.totalSpent || 0),
          lastOrderDate: data.last_order_date || data.lastOrderDate || "",
          status: data.status || "",
          addresses: data.addresses || data.address || [],
          orders: data.orders || [],
          notes: data.notes || "",
        }

        setCustomer(c)
      })
      .catch((err) => {
        console.error(err)
        if (!mounted) return
        setError(err?.payload?.error || err.message || "Failed to load customer")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [params.id])

  const tier = getCustomerTier(Number(customer.totalSpent))
  const averageOrderValue = customer.totalOrders ? customer.totalSpent / customer.totalOrders : 0

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-12 text-center">Loading customer…</div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="py-12 text-center text-red-600">Error: {error}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/customers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Customers
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-charcoal">
                {customer.firstName} {customer.lastName}
              </h1>
              <p className="text-muted-foreground">Customer since {customer.joinDate}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Customer
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Customer Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{customer.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">R{Number(customer.totalSpent || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">R{Math.round(averageOrderValue)}</div>
                  <p className="text-xs text-muted-foreground">Avg. Order Value</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{customer.lastOrderDate}</div>
                  <p className="text-xs text-muted-foreground">Last Order</p>
                </CardContent>
              </Card>
            </div>

            {/* Order History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customer.orders.map((order: any) => (
                    <div key={order.id || order.ID || Math.random()} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{order.id || order.ID}</p>
                          <p className="text-sm text-muted-foreground">{order.date || order.order_date}</p>
                        </div>
                        <Badge className={getStatusColor(order.status || order.order_status)}>{order.status || order.order_status}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">R{order.total}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items || order.item_count || 0} item{(order.items || order.item_count || 0) !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/orders/${order.id || order.ID}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Customer Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{customer.notes}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Customer Info
                  </div>
                  <div className="flex gap-2">
                    <Badge className={tier.color}>{tier.tier}</Badge>
                    <Badge variant={(customer.status || "") === "active" ? "default" : "secondary"}>
                      {customer.status}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {customer.joinDate}</span>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Default Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p>{customer.addresses?.[0]?.address}</p>
                  <p>
                    {customer.addresses?.[0]?.city}, {customer.addresses?.[0]?.province}
                  </p>
                  <p>{customer.addresses?.[0]?.postalCode}</p>
                  <p>{customer.addresses?.[0]?.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Customer Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p className="font-medium mb-2">Purchase Behavior:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Prefers both hair growth and scalp care products</li>
                    <li>• Orders every 2-3 months consistently</li>
                    <li>• High customer lifetime value</li>
                    <li>• Likely to recommend to others</li>
                  </ul>
                </div>
                <Separator />
                <div className="text-sm">
                  <p className="font-medium mb-2">Recommendations:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Offer loyalty program benefits</li>
                    <li>• Send new product announcements</li>
                    <li>• Consider bulk purchase discounts</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
