'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { categoryAPI } from '@/src/lib/api';
import { Loader2 } from 'lucide-react';

export default function CategoryLandingPage() {
    const router = useRouter();

    useEffect(() => {
        const redirectToFirstCategory = async () => {
            try {
                const categories = await categoryAPI.getCategories();
                if (categories && categories.length > 0) {
                    router.replace(`/user/category/${categories[0].slug}`);
                } else {
                    router.replace('/user');
                }
            } catch (error) {
                console.error('Error in category landing page:', error);
                router.replace('/user');
            }
        };

        redirectToFirstCategory();
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)]">
            <Loader2 className="w-10 h-10 text-[#10B981] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Opening categories...</p>
        </div>
    );
}
