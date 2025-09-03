"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { Package, User, MapPin, ShoppingBag, ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/account/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div>Loading...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const recentOrders = user.orders.slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Welcome back, {user.firstName}!</h1>
            <p className="text-muted-foreground">Manage your account and track your orders</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-1">Total Orders</h3>
                <p className="text-2xl font-bold text-primary">{user.orders.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <ShoppingBag className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-1">Active Orders</h3>
                <p className="text-2xl font-bold text-primary">
                  {user.orders.filter((order) => order.status === "processing" || order.status === "shipped").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-1">Saved Addresses</h3>
                <p className="text-2xl font-bold text-primary">{user.addresses.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <User className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-medium mb-1">Account Status</h3>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-heading text-xl">Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/account/orders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.date}</p>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "default"
                                : order.status === "shipped"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="mt-1"
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">R{order.total}</p>
                          <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No orders yet</p>
                    <Button asChild>
                      <Link href="/products">Start Shopping</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-between bg-transparent" asChild>
                  <Link href="/account/profile">
                    <span className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-between bg-transparent" asChild>
                  <Link href="/account/orders">
                    <span className="flex items-center">
                      <Package className="mr-2 h-4 w-4" />
                      Order History
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-between bg-transparent" asChild>
                  <Link href="/account/addresses">
                    <span className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      Manage Addresses
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-between bg-transparent" asChild>
                  <Link href="/products">
                    <span className="flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
