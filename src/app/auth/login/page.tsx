'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';

export default function LoginPage() {
    const router = useRouter();
    const openLogin = useAuthStore((state) => state.openLogin);

    useEffect(() => {
        router.replace('/');
        setTimeout(() => openLogin(), 100);
    }, [router, openLogin]);

    return (
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]" />
        </div>
    );
}