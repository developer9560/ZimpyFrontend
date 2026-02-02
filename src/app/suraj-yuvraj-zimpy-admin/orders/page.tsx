'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    ShoppingCart,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Download,
    Truck,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    ArrowLeft,
    MapPin,
    User,
    CreditCard,
    Package,
    ChevronDown,
    TrendingUp,
    DollarSign,
    X
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { adminOrdersAPI } from '@/src/lib/api';
import { AdminOrderListResponse, AdminOrderDetailResponse, OrderStatus, OrderAnalyticsResponse } from '@/src/types';
import { formatPrice, cn, formatDate } from '@/src/lib/utils';
import { ORDER_STATUS } from '@/src/lib/constants';
import Image from 'next/image';

const PAYMENT_STATUS_MAP: Record<string, { color: string, icon: React.ReactNode }> = {
    'PENDING': { color: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
    'PAID': { color: 'bg-green-500 text-white', icon: <CheckCircle2 size={12} /> },
    'CANCELLED': { color: 'bg-red-100 text-red-700', icon: <XCircle size={12} /> },
    'RETURNED': { color: 'bg-gray-100 text-gray-700', icon: <ArrowLeft size={12} /> },
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<AdminOrderListResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalElements, setTotalElements] = useState(0);
    const [page, setPage] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [orderDetail, setOrderDetail] = useState<AdminOrderDetailResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    // Analytics State
    const [analytics, setAnalytics] = useState<OrderAnalyticsResponse | null>(null);
    const [timeframe, setTimeframe] = useState<'today' | 'weekly' | 'monthly' | 'allTime'>('today');
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    const fetchAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const response = await adminOrdersAPI.getAnalytics();
            if (response.success) {
                setAnalytics(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchOrders = useCallback(async (pageNum: number = 0, isLoadMore: boolean = false) => {
        if (isLoadMore) setIsLoadingMore(true);
        else setLoading(true);

        try {
            const params: any = {
                page: pageNum,
                size: 10
            };
            if (statusFilter !== 'ALL') params.status = statusFilter;

            const response = await adminOrdersAPI.getAll(params);
            if (response.success) {
                if (isLoadMore) {
                    setOrders(prev => [...prev, ...response.data.content]);
                } else {
                    setOrders(response.data.content);
                }
                setTotalElements(response.data.totalElements);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchOrders(0, false);
    }, [fetchOrders]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        fetchOrders(nextPage, true);
    };

    const handleViewDetails = async (id: number) => {
        setSelectedOrderId(id);
        setIsSidePanelOpen(true);
        setDetailLoading(true);
        try {
            const response = await adminOrdersAPI.getById(String(id));
            if (response.success) {
                setOrderDetail(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch order details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleUpdatePaymentStatus = async (id: number, newStatus: string) => {
        try {
            // We need to add this to api.ts if not present, but for now assuming it follows the same pattern
            const response = await adminOrdersAPI.updatePaymentStatus(String(id), newStatus);
            if (response.success) {
                fetchOrders();
                if (selectedOrderId === id) {
                    handleViewDetails(id);
                }
            }
        } catch (error) {
            console.error('Failed to update payment status:', error);
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: OrderStatus) => {
        try {
            const response = await adminOrdersAPI.updateStatus(String(id), newStatus);
            if (response.success) {
                // Refresh list and detail
                fetchOrders();
                if (selectedOrderId === id) {
                    handleViewDetails(id);
                }
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const filteredOrders = orders.filter(order =>
        String(order.id).includes(searchTerm) ||
        String(order.userId).includes(searchTerm)
    );

    const stats = [
        {
            label: 'Total Orders',
            count: analytics?.[timeframe]?.totalOrders ?? 0,
            icon: <ShoppingCart size={16} />,
            color: 'bg-blue-100 text-blue-700'
        },
        {
            label: 'Total Revenue',
            count: formatPrice(analytics?.[timeframe]?.totalRevenue ?? 0),
            icon: <DollarSign size={16} />,
            color: 'bg-green-100 text-green-700'
        },
        {
            label: 'Total Profit',
            count: formatPrice(analytics?.[timeframe]?.totalProfit ?? 0),
            icon: <TrendingUp size={16} />,
            color: 'bg-emerald-100 text-emerald-700'
        },
        {
            label: 'Pending',
            count: analytics?.[timeframe]?.pendingOrders ?? 0,
            icon: <Clock size={16} />,
            color: 'bg-yellow-100 text-yellow-700'
        },
        {
            label: 'Delivered',
            count: analytics?.[timeframe]?.deliveredOrders ?? 0,
            icon: <CheckCircle2 size={16} />,
            color: 'bg-teal-100 text-teal-700'
        },
        {
            label: 'Cancelled',
            count: analytics?.[timeframe]?.cancelledOrders ?? 0,
            icon: <XCircle size={16} />,
            color: 'bg-red-100 text-red-700'
        },
    ];

    return (
        <div className="relative min-h-screen">
            <div className={cn("space-y-8 pb-10 transition-all duration-300", isSidePanelOpen ? "lg:mr-[450px]" : "")}>
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                        <p className="text-sm text-gray-500 font-medium">Process shipments and manage customer purchases.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="zimpy-btn-outline gap-2 h-11 px-4">
                            <Download size={18} />
                            <span>Export Data</span>
                        </Button>
                        <Button className="zimpy-btn-primary gap-2 h-11 px-6 shadow-xl shadow-green-500/20">
                            <Calendar size={18} />
                            <span>Calendar View</span>
                        </Button>
                    </div>
                </div>

                {/* Analytics Control & Stats Bar */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-900">
                            <TrendingUp size={20} className="text-green-500" />
                            <h2 className="font-bold text-lg uppercase tracking-wider">Business Overview</h2>
                        </div>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            {(['today', 'weekly', 'monthly', 'allTime'] as const).map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeframe(tf)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize",
                                        timeframe === tf
                                            ? "bg-white text-green-600 shadow-sm"
                                            : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    {tf === 'allTime' ? 'All Time' : tf}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-green-500 transition-all cursor-pointer">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                    <p className="text-lg font-black text-gray-900">{stat.count}</p>
                                </div>
                                <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", stat.color)}>
                                    {stat.icon}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detailed Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status Distribution */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <Filter size={18} className="text-blue-500" />
                            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Status Distribution</h3>
                        </div>
                        <div className="space-y-4">
                            {analytics && Object.entries(analytics.statusDistribution).map(([status, count]) => (
                                <div key={status} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                                        <span className="text-gray-500">{status}</span>
                                        <span className="text-gray-900">{count} orders</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                (ORDER_STATUS as any)[status]?.color?.split(' ')[0] || 'bg-gray-400'
                                            )}
                                            style={{ width: `${(count / (analytics.allTime?.totalOrders || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Today's Deep Dive */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-6">
                            <Clock size={18} className="text-orange-500" />
                            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Today's Specifics</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-1">Pending Today</p>
                                <p className="text-2xl font-black text-orange-600">{analytics?.today?.pendingOrders || 0}</p>
                            </div>
                            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                                <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-1">Delivered Today</p>
                                <p className="text-2xl font-black text-green-600">{analytics?.today?.deliveredOrders || 0}</p>
                            </div>
                            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Cancelled Today</p>
                                <p className="text-2xl font-black text-red-600">{analytics?.today?.cancelledOrders || 0}</p>
                            </div>
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">New Orders</p>
                                <p className="text-2xl font-black text-blue-600">{analytics?.today?.totalOrders || 0}</p>
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5">
                            <TrendingUp size={120} />
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Order ID or User ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-black h-11 pl-10 pr-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-green-500 transition-all text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="h-11 px-4 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-green-500 transition-all text-sm font-bold text-gray-600 cursor-pointer"
                        >
                            <option value="ALL">All Status</option>
                            {Object.keys(ORDER_STATUS).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Order Status</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm font-medium">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                                                <p className="font-bold">Loading orders...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                                            <ShoppingCart size={40} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-bold text-lg">No orders found</p>
                                            <p className="text-sm mt-1">Try adjusting your filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className={cn(
                                                "hover:bg-gray-50/50 transition-colors group cursor-pointer",
                                                selectedOrderId === order.id ? "bg-green-50/30" : ""
                                            )}
                                            onClick={() => handleViewDetails(order.id)}
                                        >
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors">#{order.id}</p>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                User ID: {order.userId}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-xs">
                                                {formatDate(order.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {formatPrice(order.totalAmount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    ORDER_STATUS[order.status]?.color || 'bg-gray-100 text-gray-600'
                                                )}>
                                                    {ORDER_STATUS[order.status]?.icon} {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                    PAYMENT_STATUS_MAP[order.paymentStatus]?.color || 'bg-gray-100 text-gray-600'
                                                )}>
                                                    {PAYMENT_STATUS_MAP[order.paymentStatus]?.icon} {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewDetails(order.id);
                                                        }}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Load More */}
                {orders.length < totalElements && (
                    <div className="flex justify-center pt-6">
                        <Button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="zimpy-btn-outline h-11 px-8 gap-2 shadow-sm hover:shadow-md transition-all group"
                        >
                            {isLoadingMore ? (
                                <div className="w-5 h-5 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
                            ) : (
                                <ChevronDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
                            )}
                            <span className="font-bold">
                                {isLoadingMore ? 'Loading More...' : `Load More Orders (${totalElements - orders.length} remaining)`}
                            </span>
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile Backdrop */}
            {isSidePanelOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidePanelOpen(false)}
                />
            )}

            {/* Side Detail Panel - Modern Draw Layout */}
            <div className={cn(
                "fixed top-0 right-0 h-screen w-full sm:w-[85%] md:w-[450px] bg-white shadow-2xl border-l border-gray-100 transition-transform duration-300 z-50 overflow-y-auto",
                isSidePanelOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {detailLoading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                    </div>
                ) : orderDetail ? (
                    <div className="p-0">
                        {/* Detail Header */}
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-50 p-6 flex items-center justify-between z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Order #{orderDetail.id}</h2>
                                <p className="text-xs text-gray-400 mt-1">{formatDate(orderDetail.createdAt)}</p>
                            </div>
                            <button
                                onClick={() => setIsSidePanelOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8 pb-20">
                            {/* Status and Action */}
                            <div className="space-y-4">
                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(['CREATED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as OrderStatus[]).map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleUpdateStatus(orderDetail.id, status)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                                    orderDetail.orderStatus === status
                                                        ? cn(ORDER_STATUS[status]?.color, "border-transparent ring-2 ring-offset-2 ring-offset-white", status === 'DELIVERED' ? 'ring-green-500' : 'ring-blue-500')
                                                        : "bg-white border-gray-200 text-gray-500 hover:border-green-500"
                                                )}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Payment Status</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(['PENDING', 'PAID', 'CANCELLED', 'RETURNED']).map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleUpdatePaymentStatus(orderDetail.id, status)}
                                                className={cn(
                                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                                                    orderDetail.paymentStatus === status
                                                        ? cn(PAYMENT_STATUS_MAP[status]?.color, "border-transparent ring-2 ring-offset-2 ring-offset-white ring-green-500")
                                                        : "bg-white border-gray-200 text-gray-500 hover:border-green-500"
                                                )}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-900">
                                    <User size={18} className="text-green-500" />
                                    <h3 className="font-bold italic">User & Shipping</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold">
                                                {orderDetail.userName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{orderDetail.userName}</p>
                                                <p className="text-xs text-gray-500 italic lowercase">{orderDetail.userEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                                            <CreditCard size={14} className="text-gray-400" />
                                            <span>Phone: {orderDetail.userPhone}</span>
                                        </div>
                                    </div>

                                    {orderDetail.shippingAddress && (
                                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <MapPin size={18} className="text-red-500 mt-1 flex-shrink-0" />
                                                <div className="text-sm">
                                                    <p className="font-bold text-gray-900">Shipping Address</p>
                                                    <p className="text-gray-600 mt-1">{orderDetail.shippingAddress.addressLine1}</p>
                                                    {orderDetail.shippingAddress.addressLine2 && <p className="text-gray-600">{orderDetail.shippingAddress.addressLine2}</p>}
                                                    <p className="text-gray-600">{orderDetail.shippingAddress.city}, {orderDetail.shippingAddress.state}, {orderDetail.shippingAddress.postalCode}</p>
                                                    <p className="text-gray-600">{orderDetail.shippingAddress.country}</p>
                                                    <p className="text-gray-600">{orderDetail.shippingAddress.contactNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Package size={18} className="text-blue-500" />
                                    <h3 className="font-bold italic">Cart Items ({orderDetail.item.length})</h3>
                                </div>
                                <div className="space-y-3">
                                    {orderDetail.item.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 transition-all group">
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                {item.productImage ? (
                                                    <Image
                                                        src={item.productImage}
                                                        alt={item.productName}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <Package className="w-full h-full p-4 text-gray-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate leading-tight">{item.productName}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">SKU: {item.skuCode}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-xs font-bold text-blue-600">{item.quantity} × {formatPrice(item.price)}</p>
                                                    <p className="text-sm font-black text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <p className="text-gray-500 font-medium text-sm">Payment Method</p>
                                <p className="font-bold text-gray-900 uppercase">{orderDetail.paymentMethod}</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <p className="text-gray-500 font-medium text-sm">Transaction ID</p>
                                <p className="text-xs font-mono text-gray-600">{orderDetail.razorpayPaymentId || 'N/A'}</p>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <p className="text-gray-500 font-medium text-sm">Razorpay Order ID</p>
                                <p className="text-xs font-mono text-gray-600">{orderDetail.razorpayOrderId || 'N/A'}</p>
                            </div>
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-gray-500 font-medium">Order Total</p>
                                <p className="text-2xl font-black text-gray-900">{formatPrice(orderDetail.totalAmount)}</p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
