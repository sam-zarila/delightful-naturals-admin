import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Mail, Phone, MapPin, Package, User, RefreshCw } from "lucide-react"
import Link from "next/link"
import { doc, getDoc, updateDoc } from "firebase/firestore/lite"
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
  createdAt: any; // Timestamp
};

type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

type Order = {
  id: string
  customer: { name: string; email: string; phone?: string; shipping: 'courier' | 'pickup'; notes?: string; address?: { city: string; province: string; line1: string; line2?: string; postalCode: string } }
  date?: string
  status: string
  total: number
  items: OrderItem[]
  shippingAddress: { city?: string; province?: string }
  paymentMethod: string
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

async function fetchOrder(id: string): Promise<Order | null> {
  try {
    const docRef = doc(firestore, 'orders', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data() as OrderData
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

      return {
        id,
        customer: { 
          name: customer.name, 
          email: customer.email, 
          phone: customer.phone,
          shipping: customer.shipping,
          notes: customer.notes,
          address: customer.address
        },
        date: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : undefined,
        status: data.status,
        total: data.totals.grandTotal,
        items,
        shippingAddress,
        paymentMethod: 'paystack',
      }
    }
    return null;
  } catch (err: any) {
    console.error('Error fetching order:', err);
    return null;
  }
}

async function updateOrderStatus(id: string, newStatus: string): Promise<boolean> {
  try {
    const docRef = doc(firestore, 'orders', id)
    await updateDoc(docRef, { status: newStatus })
    return true;
  } catch (err: any) {
    console.error('Error updating status:', err);
    return false;
  }
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const order = await fetchOrder(id);

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">Error: Order not found</div>
        </div>
      </AdminLayout>
    )
  }

  const handleStatusChange = async (newStatus: string) => {
    const success = await updateOrderStatus(id, newStatus);
    if (success) {
      // In a real app, you'd refetch or use state, but since this is server-rendered, reload the page
      window.location.reload();
    } else {
      alert('Failed to update status');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal">Order #{order.id}</h1>
            <p className="text-muted-foreground">Order details and fulfillment</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/orders" className="text-sm text-muted-foreground hover:underline">
              ← Back to Orders
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Name:</span>
                  <span>{order.customer.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{order.customer.email}</span>
                </div>
                {order.customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{order.customer.shipping}</span>
                </div>
              </div>

              {order.customer.address && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Shipping Address
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>{order.customer.address.line1}</p>
                    {order.customer.address.line2 && <p>{order.customer.address.line2}</p>}
                    <p>{order.customer.address.city}, {order.customer.address.province}</p>
                    <p>{order.customer.address.postalCode}</p>
                  </div>
                </div>
              )}

              {order.customer.notes && (
                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground italic">{order.customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Middle: Status & Totals */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Date:</span>
                <span>{order.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment:</span>
                <Badge variant="outline">Paystack</Badge>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R{(order.total - (order.customer.shipping === 'courier' ? 80 : 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{order.customer.shipping === 'courier' ? 'R80' : 'Free'}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>R{order.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-4">
                <Select value={order.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
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
              </div>
            </CardContent>
          </Card>

          {/* Right: Items List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <img src={item.image} alt={item.productName} className="w-12 h-12 rounded object-cover" />
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">R{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Quick actions for this order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => window.open(`mailto:${order.customer.email}?subject=Re: Order #${order.id}`, '_blank')}>
                <Edit className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              {order.customer.phone && (
                <Button variant="outline" onClick={() => window.open(`tel:${order.customer.phone}`, '_blank')}>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Customer
                </Button>
              )}
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}