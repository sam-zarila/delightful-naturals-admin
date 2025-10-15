"use client"

import type React from "react"

import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Eye,
  Plus,
  AlertCircle,
  MessageSquare,
  BookOpen,
} from "lucide-react"
import Link from "next/link"

// Mock data for dashboard
const dashboardData = {
  metrics: {
    totalRevenue: 45600,
    revenueChange: 12.5,
    totalOrders: 156,
    ordersChange: 8.2,
    totalCustomers: 89,
    customersChange: 15.3,
    totalProducts: 2,
    productsChange: 0,
  },
  recentOrders: [
    { id: "ORD001", customer: "Thandiwe Mthembu", total: 560, status: "processing", date: "2024-01-20", items: 2 },
    { id: "ORD002", customer: "Nomsa Dlamini", total: 300, status: "shipped", date: "2024-01-19", items: 1 },
    { id: "ORD003", customer: "Lerato Molefe", total: 260, status: "delivered", date: "2024-01-18", items: 1 },
    { id: "ORD004", customer: "Sipho Ndaba", total: 600, status: "pending", date: "2024-01-17", items: 2 },
  ],
  lowStockAlerts: [{ product: "Mega Potent Hair Growth Oil", stock: 5, threshold: 10 }],
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  prefix = "",
}: {
  title: string
  value: number
  change: number
  icon: React.ElementType
  prefix?: string
}) {
  const isPositive = change >= 0
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}
          {value.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
          )}
          <span className={isPositive ? "text-green-600" : "text-red-600"}>
            {isPositive ? "+" : ""}
            {change}%
          </span>
          <span className="ml-1">from last month</span>
        </p>
      </CardContent>
    </Card>
  )
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

export default function AdminDashboardPage() {
  const { metrics, recentOrders, lowStockAlerts } = dashboardData

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Alerts */}
        {lowStockAlerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-800">
                <AlertCircle className="h-5 w-5 mr-2" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowStockAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-orange-700">
                      {alert.product} - Only {alert.stock} units left
                    </span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/admin/products">Restock</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Revenue" value={metrics.totalRevenue} change={metrics.revenueChange} icon={DollarSign} prefix="R" />
          <MetricCard title="Total Orders" value={metrics.totalOrders} change={metrics.ordersChange} icon={ShoppingCart} />
          <MetricCard title="Total Customers" value={metrics.totalCustomers} change={metrics.customersChange} icon={Users} />
          <MetricCard title="Total Products" value={metrics.totalProducts} change={metrics.productsChange} icon={Package} />
        </div>

        {/* Quick Actions (now includes Testimonials & Journal) */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <Button asChild className="h-auto p-4 flex-col">
                <Link href="/admin/products/add">
                  <Plus className="h-6 w-6 mb-2" />
                  Add Product
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 flex-col bg-transparent">
                <Link href="/admin/orders">
                  <Eye className="h-6 w-6 mb-2" />
                  View Orders
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 flex-col bg-transparent">
                <Link href="/admin/customers">
                  <Users className="h-6 w-6 mb-2" />
                  Manage Customers
                </Link>
              </Button>

              <Button asChild variant="outline" className="h-auto p-4 flex-col bg-transparent">
                <Link href="/">
                  <Eye className="h-6 w-6 mb-2" />
                  View Store
                </Link>
              </Button>

              {/* NEW: Manage Testimonials */}
              <Button asChild variant="outline" className="h-auto p-4 flex-col bg-transparent">
                <Link href="/admin/testimonials">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  Manage Testimonials
                </Link>
              </Button>

              {/* NEW: Manage Journal */}
              <Button asChild variant="outline" className="h-auto p-4 flex-col bg-transparent">
                <Link href="/admin/journal">
                  <BookOpen className="h-6 w-6 mb-2" />
                  Manage Journal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders and their status</CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-[12px] font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R{order.total}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.items} item{order.items !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="hidden md:flex text-right ml-4">
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
