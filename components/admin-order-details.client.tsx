"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Package, User, MapPin, CreditCard, Phone, Mail, Download, Truck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
        default:
            return method
    }
}

export default function AdminOrderDetailsClient({ initialOrder, orderId }: { initialOrder: Order; orderId: string }) {
    const [order, setOrder] = useState<Order>(initialOrder)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [orderStatus, setOrderStatus] = useState<string | undefined>(initialOrder.status)

    const handleStatusUpdate = async (newStatus: string) => {
        const previous = orderStatus
        setOrderStatus(newStatus)
        setOrder((prev) => ({ ...prev, status: newStatus }))

        try {
            const res = await fetch(API_ENDPOINT, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: orderId, payment_status: newStatus }),
            })
            if (!res.ok) throw new Error(`API patch error: ${res.status}`)
        } catch (err: any) {
            console.error(err)
            // revert UI change on failure
            setOrderStatus(previous)
            setOrder((prev) => ({ ...prev, status: previous }))
            if (typeof err?.message === "string") setError(err.message)
        }
    }

    if (loading) {
        return <div className="py-20 text-center">Loading order...</div>
    }

    if (error) {
        return <div className="py-20 text-center text-red-600">Error loading order: {error}</div>
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="sm">
                        <Link href="/admin/orders">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Orders
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-charcoal">Order {order.id}</h1>
                        <p className="text-muted-foreground">Placed on {order.date}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Print Invoice
                    </Button>
                    <Button variant="outline">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Customer
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Order Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Order Status
                                <Badge className={getStatusColor(orderStatus ?? "")}>{orderStatus ?? "unknown"}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                <Select value={orderStatus} onValueChange={handleStatusUpdate}>
                                    <SelectTrigger className="w-48">
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
                                {order.trackingNumber && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Truck className="h-4 w-4" />
                                        Tracking: {order.trackingNumber}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="mr-2 h-5 w-5" />
                                Order Items
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                                        <div className="relative w-16 h-16">
                                            <Image src={item.image || "/placeholder.svg"} alt={item.productName ?? "Product"} fill className="object-cover rounded" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{item.productName}</h4>
                                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">R{item.price * item.quantity}</p>
                                            <p className="text-sm text-muted-foreground">R{item.price} each</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {order.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">{order.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <User className="mr-2 h-5 w-5" />
                                Customer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="font-medium">{order.customer.name}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Mail className="h-4 w-4" />
                                    {order.customer.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Phone className="h-4 w-4" />
                                    {order.customer.phone}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="mr-2 h-5 w-5" />
                                Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm">
                                <p>{order.shippingAddress.address}</p>
                                <p>
                                    {order.shippingAddress.city}, {order.shippingAddress.province}
                                </p>
                                <p>{order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CreditCard className="mr-2 h-5 w-5" />
                                Payment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span>Payment Method:</span>
                                <span>{getPaymentMethodLabel(order.paymentMethod ?? "")}</span>
                            </div>
                            <Separator />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>R{order.subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span>R{order.shipping}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span>R{order.tax}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-medium">
                                    <span>Total:</span>
                                    <span>R{order.total}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
