'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RefreshCw,
  Edit,
  Mail,
  Phone,
  MapPin,
  Package,
  User,
} from 'lucide-react';

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase-client';
import { AdminLayout } from '@/components/admin-layout';

/* ========================= Catalog (for fallback) ========================= */
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

/* ========================= Firestore data shapes ========================= */
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
  items: Array<
    | { id: string; qty: number } // your checkout used this minimal shape
    | { id: string; qty: number; name?: string; price?: number; lineTotal?: number }
  >;
  totals: {
    subtotal: number;
    shipping: number;
    grandTotal: number;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  createdAt?: any; // Firestore Timestamp | number | string
};

type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
};

type Order = {
  id: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    shipping: 'courier' | 'pickup';
    notes?: string;
    address?: {
      city: string;
      province: string;
      line1: string;
      line2?: string;
      postalCode: string;
    };
  };
  date?: string;
  status: string;
  total: number;
  items: OrderItem[];
  shippingAddress: { city?: string; province?: string };
  paymentMethod: string;
};

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const ref = doc(firestore, 'orders', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setError('Order not found');
        setOrder(null);
        return;
      }

      const data = snap.data() as OrderData;

      // Map items robustly (works whether you stored only id/qty or also name/price)
      const mappedItems: OrderItem[] = (data.items || []).map((it: any) => {
        const fromCatalog = CATALOG[it.id];
        const price = typeof it.price === 'number' ? it.price : fromCatalog?.price ?? 0;
        const name = it.name ?? fromCatalog?.name ?? it.id;
        const image = fromCatalog?.img ?? '/placeholder.svg?height=80&width=80';

        return {
          productId: it.id,
          productName: name,
          quantity: it.qty,
          price,
          image,
        };
      });

      const shippingAddress =
        data.customer.shipping === 'courier' && data.customer.address
          ? {
              city: data.customer.address.city,
              province: data.customer.address.province,
            }
          : { city: undefined, province: undefined };

      // createdAt normalization
      const createdAtRaw = (data as any).createdAt;
      const createdAt: Date =
        createdAtRaw?.toDate?.() ??
        (typeof createdAtRaw === 'number' || typeof createdAtRaw === 'string'
          ? new Date(createdAtRaw)
          : undefined);

      const mapped: Order = {
        id,
        customer: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
          shipping: data.customer.shipping,
          notes: data.customer.notes,
          address: data.customer.address,
        },
        date: createdAt ? createdAt.toLocaleDateString() : undefined,
        status: data.status,
        total: data.totals?.grandTotal ?? 0,
        items: mappedItems,
        shippingAddress,
        paymentMethod: 'paystack',
      };

      setOrder(mapped);
      setStatus(data.status);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!id || !order) return;
    setUpdatingStatus(true);
    setError(null);
    try {
      const ref = doc(firestore, 'orders', id);

      // ✅ Valid use of sentinels:
      // - `serverTimestamp()` only as direct field value
      // - Inside arrays, use concrete timestamps like `Timestamp.now()`
      await updateDoc(ref, {
        status: newStatus,
        statusUpdatedAt: serverTimestamp(),
        statusHistory: arrayUnion({
          status: newStatus,
          at: Timestamp.now(), // or new Date()
          by: 'admin',
        }),
      });

      setStatus(newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (e: any) {
      setError('Failed to update status: ' + (e?.message || String(e)));
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">Loading order details...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center text-red-600">Error: {error || 'Order not found'}</div>
        </div>
      </AdminLayout>
    );
  }

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
                    <p>
                      {order.customer.address.city}, {order.customer.address.province}
                    </p>
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
          <Card>
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
                <Select value={status} onValueChange={(value) => updateOrderStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {updatingStatus && (
                  <p className="text-xs text-muted-foreground mt-1">Updating...</p>
                )}
                {error && (
                  <p className="text-xs text-red-600 mt-2">{error}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right: Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      R{(item.price * item.quantity).toLocaleString()}
                    </p>
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
              <Button
                variant="outline"
                onClick={() =>
                  window.open(
                    `mailto:${order.customer.email}?subject=Re: Order #${order.id}`,
                    '_blank'
                  )
                }
              >
                <Edit className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              {order.customer.phone && (
                <Button
                  variant="outline"
                  onClick={() => window.open(`tel:${order.customer.phone}`, '_blank')}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Call Customer
                </Button>
              )}
              <Button variant="outline" onClick={fetchOrder} disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
