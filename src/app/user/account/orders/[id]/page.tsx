'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ordersAPI } from '@/src/lib/api';
import { Order } from '@/src/types';
import { Button } from '@/src/components/ui/Button';
import { CreditCard, MapPin } from 'lucide-react';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/src/lib/constants';
import { cn, formatDate, formatPrice } from '@/src/lib/utils';
import { ORDER_STATUS } from '@/src/lib/constants';
import Image from 'next/image';


export default function OrderDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                // Ensure orderAPI.getById fetches full details including items
                const data = await ordersAPI.getById(id);
                setOrder(data);
            } catch (error) {
                console.error("Failed to fetch order details", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
                <Link href="/user/account/orders">
                    <Button variant="outline" className="mt-4">Back to Orders</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/user/account/orders" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
                        <p className="text-sm text-gray-500">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>
                {/* Order Actions - Cancel? */}
                {['PENDING', 'CREATED'].includes(order.status) && (
                    <Button variant="outline" className="text-red-500 hover:bg-red-50 border-red-200">
                        Cancel Order
                    </Button>
                )}
            </div>

            {/* Status Bar */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-xl", ORDER_STATUS[order.status]?.color)}>
                        {ORDER_STATUS[order.status]?.icon || <Package size={24} />}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Order Status</p>
                        <p className={cn("text-sm font-semibold", ORDER_STATUS[order.status]?.color.split(' ')[1])}>
                            {ORDER_STATUS[order.status]?.label || order.status}
                        </p>
                    </div>
                </div>
                {/* Timeline mock/real could go here */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Package size={18} className="text-gray-400" />
                                Order Items ({order.items.length})
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {order.items.map((item) => (
                                <div key={item.id} className="p-4 flex gap-4">
                                    <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                        {item.product?.images?.[0]?.imageUrl ? (
                                            <Image
                                                src={item.product.images[0].imageUrl}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Package size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate hover:text-green-600 transition-colors">
                                            <Link href={ROUTES.PRODUCT_DETAIL(String(item.product.id))}>
                                                {item.product.name}
                                            </Link>
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Qty: {item.quantity} × {formatPrice(item.price)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">{formatPrice(item.total)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="space-y-6">
                    {/* Shipping Address */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-gray-400" />
                            Shipping Address
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            {order.shippingAddress ? (
                                <>
                                    <p className="font-medium text-gray-900">{order.shippingAddress.contactNumber}</p>
                                    <p>{order.shippingAddress.addressLine1}</p>
                                    <p>{order.shippingAddress.addressLine2}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                                </>
                            ) : (
                                <p className="text-gray-400 italic">Address details unavailable</p>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <CreditCard size={18} className="text-gray-400" />
                            Payment Details
                        </h3>
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">Method</span>
                            <span className="font-medium text-gray-900 capitalize">{order.paymentMethod}</span>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-gray-50">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900">{formatPrice(order.subtotal || order.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Delivery</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="flex justify-between font-bold text-base pt-2 border-t border-dashed border-gray-200 mt-2">
                                <span className="text-gray-900">Total Paid</span>
                                <span className="text-green-600">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
