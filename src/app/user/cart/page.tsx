'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useCartStore } from '@/src/store/cartStore';
import { CartItem } from '@/src/components/cart/CartItem';
import { CartSummary } from '@/src/components/cart/CartSummary';
import { EmptyCart } from '@/src/components/cart/EmptyCart';
import { Button } from '@/src/components/ui/Button';

export default function CartPage() {
    const { items, itemCount, clearCart } = useCartStore();

    if (items.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-10 animate-fadeIn">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10 md:relative">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/">
                                <div className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden">
                                    <ArrowLeft size={20} className="text-gray-600" />
                                </div>
                            </Link>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">Your Cart</h1>
                                <p className="text-xs md:text-sm text-gray-500 font-medium">{itemCount} Items</p>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to clear your cart?')) {
                                    clearCart();
                                }
                            }}
                            className="hidden md:flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 hover:bg-red-50 rounded-lg"
                        >
                            <Trash2 size={16} />
                            <span>Clear Cart</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 md:py-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <CartItem key={item.id} item={item} />
                            ))}
                        </div>

                        {/* Mobile: Clear Cart Button */}
                        <div className="md:hidden pt-4">
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to clear your cart?')) {
                                        clearCart();
                                    }
                                }}
                                className="w-full py-4 text-sm font-semibold text-gray-400 hover:text-red-500 flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} />
                                <span>Clear Cart</span>
                            </button>
                        </div>
                    </div>

                    {/* Cart Summary */}
                    <div className="w-full lg:w-[380px]">
                        <CartSummary />
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar for Checkout (Optional, since summary has it) */}
            {/* In many apps, on mobile, the price and checkout button stick to the bottom */}
        </div>
    );
}
