'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Search } from 'lucide-react';
import { ordersAPI } from '@/src/lib/api';
import { Order } from '@/src/types/order';
import { OrderCard } from '@/src/components/account/OrderCard';
import { Button } from '@/src/components/ui/Button';
import { ROUTES } from '@/src/lib/constants';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (page === 1) setIsLoading(true);
                const data = await ordersAPI.getAll(page);

                if (data && Array.isArray(data.orders)) {
                    if (page === 1) {
                        setOrders(data.orders);
                    } else {
                        setOrders(prev => [...prev, ...data.orders]);
                    }
                    setHasMore(data.page < data.totalPages);
                } else {
                    if (page === 1) setOrders([]);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [page]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-sm text-gray-500">View and track your past orders</p>
                </div>

                {/* Search Orders (Future Implementation) */}
                {/* <div className="relative hidden md:block w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
                type="text" 
                placeholder="Search orders..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#10B981] text-sm"
            />
        </div> */}
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-gray-100 h-48 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Orders Yet</h3>
                    <p className="text-gray-500 mb-6">Looks like you haven&apos;t ordered anything yet</p>
                    <Link href={ROUTES.HOME}>
                        <Button>Start Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                    ))}

                    {/* Pagination / Load More (Simple layout for now) */}
                    {hasMore && (
                        <div className="text-center pt-6 pb-4">
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => p + 1)}
                                className="min-w-[200px]"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Loading...' : 'Load More Orders'}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
