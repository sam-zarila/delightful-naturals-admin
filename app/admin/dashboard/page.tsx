"use client"

import { useEffect, useState } from "react"
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
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { collection, getDocs, query, orderBy } from "firebase/firestore/lite"
import { firestore } from "@/lib/firebase-client"

type OrderData = {
  id?: string;
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
  createdAt: any; // Timestamp
};

type ProductData = {
  id: string;
  name: string;
  price: number;
  size: string;
  inStock: boolean;
  blurb: string;
  howToUse: string[];
  benefits: string[];
  gallery?: string[];
  rating: number;
  reviews: number;
  updatedAt: number;
};

type DashboardMetrics = {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  totalProducts: number;
  productsChange: number;
}

type RecentOrder = {
  id: string;
  customer: string;
  total: number;
  status: string;
  date: string;
  items: number;
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

function computeMetrics(orders: OrderData[]): DashboardMetrics {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.totals.grandTotal, 0);
  const uniqueCustomers = new Set(orders.map(order => order.customer.email));
  const totalCustomers = uniqueCustomers.size;

  // Simple change calculations (last 30 days vs previous 30 days)
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const prev30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentOrders = orders.filter(order => {
    const orderDate = order.createdAt.toDate();
    return orderDate >= last30Days;
  });
  const olderOrders = orders.filter(order => {
    const orderDate = order.createdAt.toDate();
    return orderDate >= prev30Days && orderDate < last30Days;
  });

  const recentRevenue = recentOrders.reduce((sum, order) => sum + order.totals.grandTotal, 0);
  const olderRevenue = olderOrders.reduce((sum, order) => sum + order.totals.grandTotal, 0);
  const revenueChange = olderRevenue > 0 ? ((recentRevenue - olderRevenue) / olderRevenue * 100) : 0;

  const recentOrderCount = recentOrders.length;
  const olderOrderCount = olderOrders.length;
  const ordersChange = olderOrderCount > 0 ? ((recentOrderCount - olderOrderCount) / olderOrderCount * 100) : 0;

  const recentCustomers = new Set(recentOrders.map(order => order.customer.email));
  const olderCustomers = new Set(olderOrders.map(order => order.customer.email));
  const recentCustomerCount = recentCustomers.size;
  const olderCustomerCount = olderCustomers.size;
  const customersChange = olderCustomerCount > 0 ? ((recentCustomerCount - olderCustomerCount) / olderCustomerCount * 100) : 0;

  const productsChange = 0; // Will be computed from dynamic products fetch

  return {
    totalRevenue,
    revenueChange,
    totalOrders,
    ordersChange,
    totalCustomers,
    customersChange,
    totalProducts: 0, // Will be set from dynamic fetch
    productsChange,
  };
}

function computeRecentOrders(orders: OrderData[], limit = 4): RecentOrder[] {
  return orders
    .sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime())
    .slice(0, limit)
    .map(order => ({
      id: order.id || 'ORD' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      customer: order.customer.name,
      total: order.totals.grandTotal,
      status: order.status,
      date: order.createdAt.toDate().toLocaleDateString(),
      items: order.items.length,
    }));
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalCustomers: 0,
    customersChange: 0,
    totalProducts: 0,
    productsChange: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch orders
        const ordersQuery = query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
        const ordersSnapshot = await getDocs(ordersQuery);
        const orders: OrderData[] = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as unknown as OrderData) }));

        // Fetch products for dynamic totalProducts
        const productsQuery = collection(firestore, 'products');
        const productsSnapshot = await getDocs(productsQuery);
        const fetchedProducts: ProductData[] = productsSnapshot.docs.map(doc => {
          const data = doc.data() as unknown as ProductData;
          const { id: _id, ...rest } = data || {};
          return { id: doc.id, ...rest };
        });

        const computedMetrics = {
          ...computeMetrics(orders),
          totalProducts: fetchedProducts.length,
          productsChange: 0, // Can be computed if you have historical data
        };
        const computedRecentOrders = computeRecentOrders(orders);

        setMetrics(computedMetrics);
        setRecentOrders(computedRecentOrders);
        setProducts(fetchedProducts);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">
            <AlertCircle className="h-8 w-8 mx-auto mb-4" />
            <p>Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>

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
            {change.toFixed(1)}%
          </span>
          <span className="ml-1">from last month</span>
        </p>
      </CardContent>
    </Card>
  )
}