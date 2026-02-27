'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export const EmptyCart = () => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                <ShoppingCart className="w-10 h-10 text-[#10B981]" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Cart is Empty
            </h2>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                Looks like you haven't added anything to your cart yet.
                Explore our fresh categories and find something you like!
            </p>

            <Link
                href="/"
                className="px-8 py-3 bg-[#10B981] text-white font-bold rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-100 hover:shadow-green-200 active:scale-95"
            >
                <h1 className='text-white'> Start Shopping</h1>

            </Link>
        </div>
    );
};
