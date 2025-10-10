import React from "react"
import { AdminLayout } from "@/components/admin-layout"
import AdminOrderDetailsClient from "@/components/admin-order-details.client"

interface OrderDetailsPageProps {
  params: {
    id: string
  }
}

type ApiOrder = {
  order_id: string
  total: number
  subtotal?: number
  shipping?: number
  tax?: number
  delivery_method?: string
  payment_status?: string
  payment_provider?: string
  created_at?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  items?: Array<{ quantity: number; price: number; name?: string; volume?: string; image_url?: string }>
  address_line1?: string
  address_line2?: string
  city?: string
  province?: string
  postal_code?: string
}

type Order = {
  id: string
  customer: { name: string; email: string; phone?: string }
  date?: string
  status?: string
  total: number
  subtotal?: number
  shipping?: number
  tax?: number
  items: Array<{ productId?: string; productName?: string; quantity: number; price: number; image?: string }>
  shippingAddress: { address?: string; city?: string; province?: string; postalCode?: string; country?: string }
  paymentMethod?: string
  trackingNumber?: string
  notes?: string
}

const API_ENDPOINT = process.env.NEXT_PUBLIC_ORDERS_API || "http://localhost/delightful/orders.php"

async function fetchOrder(id: string): Promise<Order> {
  const url = `${API_ENDPOINT}?id=${encodeURIComponent(id)}`
  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Order ${id} not found`)
    throw new Error(`API error: ${res.status}`)
  }
  const a: ApiOrder = await res.json()

  const mapped: Order = {
    id: String(a.order_id),
    customer: { name: `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim() || (a.email ?? "Unknown"), email: a.email ?? "", phone: a.phone },
    date: a.created_at ?? undefined,
    status: (a.payment_status ?? "pending").toLowerCase(),
    total: a.total ?? 0,
    subtotal: a.subtotal ?? a.total ?? 0,
    shipping: a.shipping ?? 0,
    tax: a.tax ?? 0,
    items: (a.items ?? []).map((it) => ({ productId: undefined, productName: it.name ?? it.volume ?? "Product", quantity: it.quantity ?? 1, price: it.price ?? 0, image: it.image_url ?? "/placeholder.svg?height=80&width=80" })),
    shippingAddress: { address: a.address_line1 ?? a.address_line2 ?? undefined, city: a.city ?? undefined, province: a.province ?? undefined, postalCode: a.postal_code ?? undefined, country: undefined },
    paymentMethod: (a.payment_provider ?? "unknown").toLowerCase(),
    trackingNumber: undefined,
    notes: undefined,
  }

  return mapped
}

export default async function OrderDetailsPage(props: any) {
  const { params } = props
  try {
    const order = await fetchOrder(params.id)

    return (
      <AdminLayout>
        {/* Pass pre-fetched order to client component; client won't access route params directly */}
        <AdminOrderDetailsClient initialOrder={order} orderId={params.id} />
      </AdminLayout>
    )
  } catch (err: any) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-red-600">Error loading order: {err?.message ?? String(err)}</div>
      </AdminLayout>
    )
  }
}
