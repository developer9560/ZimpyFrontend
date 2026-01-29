'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { wishlistAPI } from '@/src/lib/api';
import { Product } from '@/src/types/product';
import { ProductCard } from '@/src/components/product/ProductCard';
import { Button } from '@/src/components/ui/Button';
import { ROUTES } from '@/src/lib/constants';

export default function WishlistPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWishlist = async () => {
        try {
            setIsLoading(true);
            const data = await wishlistAPI.get();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">My Wishlist</h1>
                    <p className="text-sm text-gray-500">Items you have saved for later</p>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-100 h-80 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Your Wishlist is Empty</h3>
                    <p className="text-gray-500 mb-6">Save items you love to find them easily later</p>
                    <Link href={ROUTES.HOME}>
                        <Button>Explore Products</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
