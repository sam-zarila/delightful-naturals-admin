"use client"

import { useEffect, useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Mail, Phone, MapPin, ShoppingBag, Calendar, Filter } from "lucide-react"
import Link from "next/link"
import { fetchCustomers } from "@/lib/api"

function getCustomerTier(totalSpent: number) {
  if (totalSpent >= 1000) return { tier: "VIP", color: "bg-purple-100 text-purple-800" }
  if (totalSpent >= 500) return { tier: "Gold", color: "bg-yellow-100 text-yellow-800" }
  if (totalSpent >= 200) return { tier: "Silver", color: "bg-gray-100 text-gray-800" }
  return { tier: "Bronze", color: "bg-orange-100 text-orange-800" }
}

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    fetchCustomers()
      .then((data) => {
        // The PHP endpoint returns an array or an object; ensure array
        const list = Array.isArray(data) ? data : (data && data.length ? data : [])
        if (mounted) setCustomers(list)
      })
      .catch((err) => {
        console.error(err)
        if (mounted) setError(err?.payload?.error || err.message || "Failed to load customers")
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const filteredCustomers = customers.filter((customer) => {
    const first = (customer.first_name || customer.firstName || "").toString()
    const last = (customer.last_name || customer.lastName || "").toString()
    const email = (customer.email || "").toString()
    const phone = (customer.phone || "").toString()

    const matchesSearch =
      first.toLowerCase().includes(searchTerm.toLowerCase()) ||
      last.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || (customer.status || "").toString() === statusFilter

    return matchesSearch && matchesStatus
  })

  const customerStats = {
    total: customers.length,
    active: customers.filter((c) => (c.status || "") === "active").length,
    inactive: customers.filter((c) => (c.status || "") === "inactive").length,
    totalRevenue: customers.reduce((sum, c) => sum + Number(c.total_spent || c.totalSpent || 0), 0),
    averageOrderValue:
      customers.length > 0
        ? customers.reduce((sum, c) => sum + Number(c.total_spent || c.totalSpent || 0), 0) / customers.length
        : 0,
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Customers</h1>
            <p className="text-muted-foreground">Manage your customer relationships and insights</p>
          </div>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Send Newsletter
          </Button>
        </div>

        {/* Customer Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{customerStats.total}</div>
              <p className="text-xs text-muted-foreground">Total Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{customerStats.active}</div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{customerStats.inactive}</div>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">R{customerStats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">R{Math.round(customerStats.averageOrderValue)}</div>
              <p className="text-xs text-muted-foreground">Avg. Customer Value</p>
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
                  placeholder="Search customers by name, email, or phone..."
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
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
            <CardDescription>Customer profiles and purchase history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading && (
                <div className="text-center py-8">Loading customers...</div>
              )}

              {error && (
                <div className="text-center py-8 text-red-600">Error: {error}</div>
              )}

              {!loading && !error &&
                filteredCustomers.map((customer) => {
                  const first = customer.first_name || customer.firstName || ""
                  const last = customer.last_name || customer.lastName || ""
                  const totalSpent = Number(customer.total_spent || customer.totalSpent || 0)
                  const tier = getCustomerTier(totalSpent)
                  return (
                    <div
                      key={customer.id || `${first}-${last}-${Math.random()}`}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">
                              {first} {last}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </div>
                          </div>
                          <Badge className={tier.color}>{tier.tier}</Badge>
                          <Badge variant={(customer.status || "") === "active" ? "default" : "secondary"}>
                            {customer.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.addresses?.[0]?.city}, {customer.addresses?.[0]?.province}
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Joined {customer.join_date || customer.joinDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-medium">R{totalSpent.toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ShoppingBag className="h-3 w-3" />
                            {customer.total_orders || customer.totalOrders || 0} order{(customer.total_orders || customer.totalOrders || 0) !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Last order</p>
                          <p className="text-sm font-medium">{customer.last_order_date || customer.lastOrderDate}</p>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/customers/${customer.id || customer.ID}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No customers found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
