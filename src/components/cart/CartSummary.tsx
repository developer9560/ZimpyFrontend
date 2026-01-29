'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/src/store/cartStore';
import { formatPrice } from '@/src/lib/utils';

export const CartSummary = () => {
    const { subtotal, discount, deliveryCharges, total, itemCount } = useCartStore();
    const savings = discount;

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                )}

                <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery Charges</span>
                    <span className="font-medium text-gray-900">
                        {deliveryCharges === 0 ? (
                            <span className="text-green-600">FREE</span>
                        ) : (
                            formatPrice(deliveryCharges)
                        )}
                    </span>
                </div>

                <div className="h-px bg-gray-100 my-4" />

                <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span>{formatPrice(total)}</span>
                </div>

                {savings > 0 && (
                    <div className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-2 rounded-lg text-center mt-2 border border-green-100">
                        You will save {formatPrice(savings)} on this order using Zimpy! 🥳
                    </div>
                )}
            </div>

            <Link
                href="/user/checkout"
                className="w-full flex text-white items-center opacity-100 justify-center gap-2 bg-[#10B981] hover:text-white hover:bg-[#059669] font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-green-200 active:scale-[0.98]"
            >
                <span className="opacity-100 text-white" >Checkout Securely</span>
                <ArrowRight size={18} />
            </Link>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span>100% Safe & Secure Payments</span>
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            </div>
        </div>
    );
};
