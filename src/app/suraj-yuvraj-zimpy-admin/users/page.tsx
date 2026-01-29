'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Search, MoreVertical, Mail, Phone, Calendar, Shield, Trash2, Ban, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { formatPrice } from '@/src/lib/utils';
import { adminAPI } from '@/src/lib/api';
import { UserDetailResponse, AdminUserAnalyticsResponse } from '@/src/types';
import { toast, ToastContainer } from 'react-toastify';
import { handleSuccess, handleError } from '@/src/lib/Error';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserDetailResponse[]>([]);
    const [analytics, setAnalytics] = useState<AdminUserAnalyticsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getUsers(currentPage, pageSize, statusFilter, roleFilter);
            if (response.success && response.data) {
                setUsers(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            setUsers([]);
            handleError(error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, statusFilter, roleFilter]);

    const fetchAnalytics = useCallback(async () => {
        try {
            const response = await adminAPI.getAnalytics();
            if (response.success && response.data) {
                setAnalytics(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    useEffect(() => {
        setCurrentPage(0);
    }, [statusFilter, roleFilter]);

    const handleUpdateStatus = async (userId: number, newStatus: string) => {
        try {
            const response = await adminAPI.updateUserStatus(userId, newStatus);
            if (response.success) {
                toast.success(`User status updated to ${newStatus}`);

                // Locally update only the specific user's status to avoid full page reload
                setUsers(prevUsers =>
                    prevUsers.map(u => u.id === userId ? { ...u, status: newStatus as any } : u)
                );

                // Also update the analytics locally or re-fetch it (it's a small call)
                fetchAnalytics();
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error: any) {
            console.error('Status update failed:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const filteredUsers = (users || []).filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery))
    );

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage your customer base and their permissions.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-11 px-4 bg-white border border-gray-200 rounded-xl outline-none text-black focus:border-[#10B981] text-sm font-medium"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="BLOCKED">Blocked</option>
                    </select>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="h-11 px-4 bg-white text-black border border-gray-200 rounded-xl outline-none focus:border-[#10B981] text-sm font-medium"
                    >
                        <option value="">All Roles</option>
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: analytics?.totalUsers || 0, sub: `+${analytics?.newThisMonth || 0} this month`, icon: <Users size={24} />, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { label: 'Active Users', value: analytics?.activeUsers || 0, sub: 'Current active base', icon: <CheckCircle2 size={24} />, color: 'text-green-500', bg: 'bg-green-50' },
                    { label: 'Blocked Users', value: analytics?.blockeUsers || 0, sub: 'Needs review', icon: <Ban size={24} />, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'New Today', value: analytics?.newToday || 0, sub: 'Last 24 hours', icon: <Calendar size={24} />, color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-xl font-black text-gray-900">{stat.value.toLocaleString()}</h3>
                            <p className="text-[10px] text-gray-500 font-medium mt-1">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* User List Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-transparent text-black rounded-xl outline-none focus:bg-white focus:border-[#10B981] transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined At</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm font-medium">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8 h-16 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.email} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                                                    {/* {user.name.charAt(0)} */}
                                                    {/* {user.name.split(' ')[0].charAt(0)} */}

                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 group-hover:text-[#10B981] transition-colors">{user.name}</p>
                                                    <p className="text-[10px] font-mono text-gray-400">ID: {user.email.split('@')[0].toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Mail size={12} className="text-gray-400" />
                                                    <span>{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    <Phone size={12} className="text-gray-400" />
                                                    <span>{user.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                user.status === 'INACTIVE' ? 'bg-gray-100 text-gray-500' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {user.status !== 'BLOCKED' ? (
                                                    <button
                                                        onClick={() => handleUpdateStatus(user.id, 'BLOCKED')}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Ban User"
                                                    >
                                                        <Ban size={16} />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUpdateStatus(user.id, 'ACTIVE')}
                                                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all" title="Activate User"
                                                    >
                                                        <CheckCircle2 size={16} />
                                                    </button>
                                                )}
                                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users size={40} className="text-gray-200" />
                                            <p className="text-gray-500 font-medium">No users found match your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 border-t border-gray-50 flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-medium">
                        Showing page {currentPage + 1} of {totalPages || 1}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0 || isLoading}
                            className="h-9 px-3 bg-white border border-gray-200 text-gray-600 disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </Button>
                        <Button
                            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage >= totalPages - 1 || isLoading}
                            className="h-9 px-3 bg-white border border-gray-200 text-gray-600 disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </Button>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}
