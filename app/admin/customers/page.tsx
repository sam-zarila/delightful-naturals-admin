"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Eye, Mail, Phone, MapPin, ShoppingBag, Calendar, Filter } from "lucide-react"
import Link from "next/link"

// Mock customers data - in real app this would come from database
const mockCustomers = [
  {
    id: "1",
    firstName: "Thandiwe",
    lastName: "Mthembu",
    email: "thandiwe@example.com",
    phone: "+27 82 123 4567",
    joinDate: "2023-11-15",
    totalOrders: 3,
    totalSpent: 1120,
    lastOrderDate: "2024-01-20",
    status: "active",
    addresses: [
      {
        id: "1",
        type: "shipping",
        address: "123 Main Street",
        city: "Johannesburg",
        province: "Gauteng",
        postalCode: "2000",
        country: "South Africa",
        isDefault: true,
      },
    ],
    orders: [
      {
        id: "ORD001",
        date: "2024-01-20",
        status: "processing",
        total: 560,
      },
      {
        id: "ORD006",
        date: "2023-12-15",
        status: "delivered",
        total: 300,
      },
      {
        id: "ORD010",
        date: "2023-11-20",
        status: "delivered",
        total: 260,
      },
    ],
  },
  {
    id: "2",
    firstName: "Nomsa",
    lastName: "Dlamini",
    email: "nomsa@example.com",
    phone: "+27 83 456 7890",
    joinDate: "2023-10-22",
    totalOrders: 2,
    totalSpent: 600,
    lastOrderDate: "2024-01-19",
    status: "active",
    addresses: [
      {
        id: "2",
        type: "shipping",
        address: "456 Oak Avenue",
        city: "Cape Town",
        province: "Western Cape",
        postalCode: "8000",
        country: "South Africa",
        isDefault: true,
      },
    ],
    orders: [
      {
        id: "ORD002",
        date: "2024-01-19",
        status: "shipped",
        total: 300,
      },
      {
        id: "ORD007",
        date: "2023-11-10",
        status: "delivered",
        total: 300,
      },
    ],
  },
  {
    id: "3",
    firstName: "Lerato",
    lastName: "Molefe",
    email: "lerato@example.com",
    phone: "+27 84 789 0123",
    joinDate: "2023-12-05",
    totalOrders: 1,
    totalSpent: 260,
    lastOrderDate: "2024-01-18",
    status: "active",
    addresses: [
      {
        id: "3",
        type: "shipping",
        address: "789 Pine Road",
        city: "Durban",
        province: "KwaZulu-Natal",
        postalCode: "4000",
        country: "South Africa",
        isDefault: true,
      },
    ],
    orders: [
      {
        id: "ORD003",
        date: "2024-01-18",
        status: "delivered",
        total: 260,
      },
    ],
  },
  {
    id: "4",
    firstName: "Sipho",
    lastName: "Ndaba",
    email: "sipho@example.com",
    phone: "+27 85 012 3456",
    joinDate: "2023-09-18",
    totalOrders: 4,
    totalSpent: 1380,
    lastOrderDate: "2024-01-17",
    status: "active",
    addresses: [
      {
        id: "4",
        type: "shipping",
        address: "321 Elm Street",
        city: "Pretoria",
        province: "Gauteng",
        postalCode: "0001",
        country: "South Africa",
        isDefault: true,
      },
    ],
    orders: [
      {
        id: "ORD004",
        date: "2024-01-17",
        status: "pending",
        total: 600,
      },
      {
        id: "ORD008",
        date: "2023-12-20",
        status: "delivered",
        total: 260,
      },
      {
        id: "ORD011",
        date: "2023-11-05",
        status: "delivered",
        total: 260,
      },
      {
        id: "ORD012",
        date: "2023-10-15",
        status: "delivered",
        total: 260,
      },
    ],
  },
  {
    id: "5",
    firstName: "Zinhle",
    lastName: "Khumalo",
    email: "zinhle@example.com",
    phone: "+27 86 345 6789",
    joinDate: "2023-08-30",
    totalOrders: 1,
    totalSpent: 0,
    lastOrderDate: "2024-01-16",
    status: "inactive",
    addresses: [
      {
        id: "5",
        type: "shipping",
        address: "654 Birch Lane",
        city: "Port Elizabeth",
        province: "Eastern Cape",
        postalCode: "6000",
        country: "South Africa",
        isDefault: true,
      },
    ],
    orders: [
      {
        id: "ORD005",
        date: "2024-01-16",
        status: "cancelled",
        total: 560,
      },
    ],
  },
]

function getCustomerTier(totalSpent: number) {
  if (totalSpent >= 1000) return { tier: "VIP", color: "bg-purple-100 text-purple-800" }
  if (totalSpent >= 500) return { tier: "Gold", color: "bg-yellow-100 text-yellow-800" }
  if (totalSpent >= 200) return { tier: "Silver", color: "bg-gray-100 text-gray-800" }
  return { tier: "Bronze", color: "bg-orange-100 text-orange-800" }
}

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const customerStats = {
    total: mockCustomers.length,
    active: mockCustomers.filter((c) => c.status === "active").length,
    inactive: mockCustomers.filter((c) => c.status === "inactive").length,
    totalRevenue: mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
    averageOrderValue: mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / mockCustomers.length,
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
              {filteredCustomers.map((customer) => {
                const tier = getCustomerTier(customer.totalSpent)
                return (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        </div>
                        <Badge className={tier.color}>{tier.tier}</Badge>
                        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
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
                          {customer.addresses[0]?.city}, {customer.addresses[0]?.province}
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {customer.joinDate}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">R{customer.totalSpent.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <ShoppingBag className="h-3 w-3" />
                          {customer.totalOrders} order{customer.totalOrders !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Last order</p>
                        <p className="text-sm font-medium">{customer.lastOrderDate}</p>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/customers/${customer.id}`}>
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
