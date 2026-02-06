'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';

export default function AdminPage() {
    const router = useRouter();
    const { isAuthenticated, isAdmin, verifyAdminRole, logout } = useAuthStore();

    useEffect(() => {
        const checkAccess = async () => {
            const BASE_PATH = '/suraj-yuvraj-zimpy-admin';
            const token = localStorage.getItem('accessToken');

            if (!token || !isAuthenticated) {
                router.replace(`${BASE_PATH}/adminlogin`);
                return;
            }

            // Verify admin role
            const hasAdminRole = await verifyAdminRole();

            if (hasAdminRole && isAdmin) {
                router.replace(`${BASE_PATH}/dashboard`);
            } else {
                // Not an admin, clear tokens and redirect to login
                logout();
                router.replace(`${BASE_PATH}/adminlogin`);
            }
        };

        checkAccess();
    }, [router, isAuthenticated, isAdmin, verifyAdminRole, logout]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto"></div>
                <p className="mt-4 text-gray-600 text-sm">Verifying access...</p>
            </div>
        </div>
    );
}
