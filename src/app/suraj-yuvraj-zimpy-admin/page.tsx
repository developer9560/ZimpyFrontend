'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const router = useRouter();


    useEffect(() => {
        // Redirect to login if not authenticated, otherwise to dashboard
        const token = localStorage.getItem('adminToken');
        if (token) {
            router.replace('/suraj-yuvraj-zimpy-admin/dashboard');
        } else {
            router.replace('/suraj-yuvraj-zimpy-admin/adminlogin');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
    );
}
