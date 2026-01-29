'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    User,
    MapPin,
    Package,
    Heart,
    LogOut,
    Settings,
    ChevronRight,
    CreditCard
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/store/authStore';
import { ROUTES } from '@/src/lib/constants';

const MENU_ITEMS = [
    {
        section: 'Account Settings',
        items: [
            { label: 'Profile Information', href: ROUTES.ACCOUNT, icon: User },
            { label: 'Manage Addresses', href: ROUTES.ADDRESSES, icon: MapPin },
        ]
    },
    {
        section: 'My Orders',
        items: [
            { label: 'My Orders', href: ROUTES.MY_ORDERS, icon: Package },
        ]
    },
    {
        section: 'My Stuff',
        items: [
            { label: 'My Wishlist', href: ROUTES.WISHLIST, icon: Heart },
        ]
    },
];

export const AccountSidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();

    return (
        <div className="w-full lg:w-[280px] shrink-0 space-y-4">
            {/* User Info Card */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                    <User className="text-[#10B981]" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Hello,</p>
                    <p className="font-semibold text-gray-900 truncate">{user?.fullName || 'User'}</p>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {MENU_ITEMS.map((section, idx) => (
                    <div key={idx} className="border-b border-gray-100 last:border-0">
                        {/* Section Header (Optional/Hidden if distinct sections preferred, mimicking Flipkart) */}
                        <div className="px-4 py-3"> {/* You could add a title here if desired */}
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg transition-colors mb-1 last:mb-0 group",
                                            isActive
                                                ? "bg-emerald-50 text-[#10B981]"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-[#10B981]"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon size={18} className={isActive ? "fill-emerald-100" : ""} />
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </div>
                                        {isActive && <ChevronRight size={16} />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 text-red-500 hover:bg-red-50 w-full p-3 rounded-lg transition-colors font-medium text-sm"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};
