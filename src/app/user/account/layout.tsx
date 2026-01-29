'use client';

import React from 'react';
import { AccountSidebar } from '@/src/components/account/AccountSidebar';

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Sidebar - Sticky on Desktop */}
                    <div className="w-full lg:w-64 lg:sticky lg:top-24 flex-shrink-0">
                        <AccountSidebar />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0 w-full">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
