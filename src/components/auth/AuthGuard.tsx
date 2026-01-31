'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';

export const AuthGuard = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, token, verifySession } = useAuthStore();

    // Routes that require authentication
    // Protect /user/account/* (profile, orders, addresses, wishlist)
    // Protect /user/checkout, /user/order-success
    // Explicitly allow /user/products, /user/cart, /user/search
    const protectedPrefixes = [
        '/user/account',
        '/user/checkout',
        '/user/order-success'
    ];

    useEffect(() => {
        // Always check session validity to handle expiry
        // verifySession checks token expiry and sets auto-logout timer
        verifySession();
    }, [pathname, verifySession]);

    useEffect(() => {
        if (!pathname) return;

        const isProtectedRoute = protectedPrefixes.some(prefix => pathname.startsWith(prefix));

        if (isProtectedRoute) {
            if (!isAuthenticated || !token) {
                // If trying to access protected route without auth, redirect to login
                router.replace('/auth/login');
            }
        }
    }, [pathname, isAuthenticated, token, router]);

    return null; // Logic-only component
};
