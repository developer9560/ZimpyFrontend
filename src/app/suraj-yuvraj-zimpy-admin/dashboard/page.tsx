'use client';

import React from 'react';
import {
    Users,
    ShoppingCart,
    Package,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/src/lib/utils';

// Mock Stats
const STATS = [
    {
        label: 'Total Sales',
        value: '₹1,24,500',
        trend: '+12.5%',
        isUp: true,
        icon: <TrendingUp size={20} />,
        color: 'from-green-500 to-emerald-600'
    },
    {
        label: 'Active Orders',
        value: '48',
        trend: '+4.3%',
        isUp: true,
        icon: <ShoppingCart size={20} />,
        color: 'from-blue-500 to-indigo-600'
    },
    {
        label: 'New Customers',
        value: '156',
        trend: '+22.1%',
        isUp: true,
        icon: <Users size={20} />,
        color: 'from-[#10B981] to-teal-600'
    },
    {
        label: 'Out of Stock',
        value: '12',
        trend: '-2.5%',
        isUp: false,
        icon: <Package size={20} />,
        color: 'from-rose-500 to-red-600'
    }
];

// Mock Recent Orders
const RECENT_ORDERS = [
    { id: 'ZMP-1024', user: 'Rahul Sharma', amount: 1250, status: 'Processing', time: '2 mins ago' },
    { id: 'ZMP-1025', user: 'Priya Singh', amount: 890, status: 'Delivered', time: '15 mins ago' },
    { id: 'ZMP-1026', user: 'Amit Verma', amount: 3200, status: 'Packing', time: '34 mins ago' },
    { id: 'ZMP-1027', user: 'Sneha Kapur', amount: 450, status: 'On the Way', time: '1 hour ago' },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-sm text-gray-500 font-medium">Welcome back, Suraj! Here&apos;s what is happening with Zimpy today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {STATS.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} text-white shadow-lg shadow-${stat.color.split('-')[1]}/20`}>
                                {stat.icon}
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Charts & Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                        <button className="text-xs font-bold text-[#10B981] hover:underline uppercase tracking-wider">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm font-medium">
                                {RECENT_ORDERS.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                                        <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-[#10B981] transition-colors">{order.id}</td>
                                        <td className="px-6 py-4 text-gray-600">{order.user}</td>
                                        <td className="px-6 py-4 text-gray-900">{formatPrice(order.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'Packing' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-purple-100 text-purple-700'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' :
                                                        order.status === 'Processing' ? 'bg-blue-500' :
                                                            order.status === 'Packing' ? 'bg-orange-500' :
                                                                'bg-purple-500'
                                                    }`} />
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-400 text-xs">{order.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Performance Side Cards */}
                <div className="space-y-6">
                    {/* Order Status Breakdown */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Order Breakdown</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Completed', count: 124, progress: 75, icon: <CheckCircle2 className="text-green-500" size={16} /> },
                                { label: 'Processing', count: 28, progress: 15, icon: <Clock className="text-blue-500" size={16} /> },
                                { label: 'Issues', count: 4, progress: 5, icon: <AlertCircle className="text-red-500" size={16} /> },
                            ].map((item) => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-bold">
                                        <div className="flex items-center gap-2">
                                            {item.icon}
                                            <span className="text-gray-900 uppercase tracking-tighter">{item.label}</span>
                                        </div>
                                        <span className="text-gray-400">{item.count}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${item.label === 'Completed' ? 'bg-green-500' :
                                                    item.label === 'Processing' ? 'bg-blue-500' :
                                                        'bg-red-500'
                                                }`}
                                            style={{ width: `${item.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Store Status Toggle */}
                        <div className="mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Store Visibility</p>
                                    <p className="text-[10px] text-gray-500">Live for all customers</p>
                                </div>
                                <div className="w-10 h-6 bg-[#10B981] rounded-full p-1 cursor-pointer">
                                    <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
