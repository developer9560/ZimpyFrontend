'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Order, OrderStatus } from '@/src/types/order';
import { ROUTES, ORDER_STATUS } from '@/src/lib/constants';
import { formatPrice, formatDate, cn } from '@/src/lib/utils';

interface OrderCardProps {
    order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    const statusConfig = ORDER_STATUS[order.status];

    // Get first few items images
    const displayedItems = order.items.slice(0, 4);
    const remainingItems = order.items.length - 4;

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-4 border-b border-gray-50 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50">
                <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 text-gray-400">
                        <Package size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            Order <span className="font-mono text-gray-500">#{order.orderNumber}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>
                <div>
                    <Badge
                        variant="default"
                        className={cn("gap-1.5 py-1 px-3", {
                            'bg-green-100 text-green-700': ['DELIVERED'].includes(order.status),
                            'bg-blue-100 text-blue-700': ['PAID', 'SHIPPED'].includes(order.status),
                            'bg-yellow-100 text-yellow-700': ['PAYMENT_PENDING', 'CREATED'].includes(order.status),
                            'bg-red-100 text-red-700': ['CANCELLED'].includes(order.status),
                        })}
                    >
                        {/* Start Icon logic based on status */}
                        {['DELIVERED'].includes(order.status) && <CheckCircle size={14} />}
                        {['CANCELLED'].includes(order.status) && <XCircle size={14} />}
                        {['PAYMENT_PENDING', 'CREATED'].includes(order.status) && <Clock size={14} />}
                        {['SHIPPED'].includes(order.status) && <Truck size={14} />}
                        {statusConfig?.label || order.status}
                    </Badge>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                    {/* Images */}
                    <div className="flex items-center gap-2">
                        {displayedItems.map((item) => (
                            <div key={item.id} className="relative w-16 h-16 rounded-lg border border-gray-100 overflow-hidden bg-gray-50">
                                {item.product.images?.[0] ? (
                                    <Image
                                        src={item.product.images[0].imageUrl}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Package size={20} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {remainingItems > 0 && (
                            <div className="w-16 h-16 rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-500 text-xs font-medium">
                                +{remainingItems} more
                            </div>
                        )}
                    </div>

                    {/* Total & Action */}
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <p className="text-lg font-bold text-gray-900">{formatPrice(order.total)}</p>
                        </div>
                        <Link href={ROUTES.ORDER_DETAIL(order.id)}>
                            <Button variant="outline" className="gap-2">
                                View Details
                                <ChevronRight size={16} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
