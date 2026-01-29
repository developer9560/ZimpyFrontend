'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';

export default function SignupPage() {
    const router = useRouter();
    const openSignup = useAuthStore((state) => state.openSignup);

    useEffect(() => {
        router.replace('/');
        setTimeout(() => openSignup(), 100);
    }, [router, openSignup]);

    return (
        <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]" />
        </div>
    );
}