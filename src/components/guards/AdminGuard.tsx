'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isAdmin, token, verifyAdminRole, logout, isLoading } = useAuthStore();
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const verifyAccess = async () => {
            const BASE_PATH = '/suraj-yuvraj-zimpy-admin';

            // Allow access to login page
            if (pathname === `${BASE_PATH}/adminlogin`) {
                setIsVerifying(false);
                return;
            }

            // Check if user is authenticated
            if (!isAuthenticated || !token) {
                router.replace(`${BASE_PATH}/adminlogin`);
                setIsVerifying(false);
                return;
            }

            // Verify admin role
            try {
                const hasAdminRole = await verifyAdminRole();

                if (!hasAdminRole) {
                    // User is authenticated but not an admin
                    logout();
                    router.replace(`${BASE_PATH}/adminlogin`);
                }
            } catch (error) {
                console.error('Admin verification failed:', error);
                logout();
                router.replace(`${BASE_PATH}/adminlogin`);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyAccess();
    }, [isAuthenticated, token, pathname, router, verifyAdminRole, logout, isAdmin]);

    // Show loading state while verifying
    if (isVerifying || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-sm">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Only render children if user is admin
    if (pathname !== '/suraj-yuvraj-zimpy-admin/adminlogin' && !isAdmin) {
        return null;
    }

    return <>{children}</>;
}
