'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle2, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import Link from 'next/link';

export default function OrderSuccessPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.orderId as string;

    // Optional: Auto-redirect after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/user/account/orders');
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center animate-fadeIn">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-[#10B981]" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
                <p className="text-gray-500 mb-8">
                    Thank you for your purchase. Your order <span className="font-mono font-medium text-gray-700">#{orderId}</span> has been confirmed.
                </p>

                <div className="space-y-3">
                    <Link href="/user/account/orders" className="block w-full">
                        <Button className="w-full h-12 flex items-center justify-center gap-2">
                            <Package size={20} />
                            View My Orders
                        </Button>
                    </Link>

                    <Link href="/" className="block w-full">
                        <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2">
                            <ShoppingBag size={20} />
                            Continue Shopping
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-400">
                        Redirecting to orders in 5 seconds...
                    </p>
                </div>
            </div>
        </div>
    );
}
