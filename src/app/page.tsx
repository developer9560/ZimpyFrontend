'use client';

import { useEffect, useState } from 'react';
import { HeroSlider } from '@/src/components/home/HeroSlider';
import "./globals.css";
import Category from '@/src/components/layout/category';
import { ProductSlider } from '@/src/components/product/ProductSlider';
import { productsAPI } from '@/src/lib/api';
import type { CategoryResponseForProductCard } from '@/src/types';
import { Loader2 } from 'lucide-react';
import { ProductCardSkeleton } from '@/src/components/ui/Skeleton';

export default function RootPage() {
    const [categoryProducts, setCategoryProducts] = useState<CategoryResponseForProductCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                setIsLoading(true);
                const data = await productsAPI.getProductsByCategory();
                console.log('Fetched category products:', data);
                // Ensure we always set an array
                setCategoryProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching category products:', err);
                setError('Failed to load products');
                setCategoryProducts([]); // Ensure it's an array even on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategoryProducts();
    }, []);

    return (
        <div className="bg-[#F9FAFB] min-h-screen pt-4 pb-20">
            <HeroSlider />
            <Category />

            {isLoading ? (
                <div className="container mx-auto space-y-8 mt-4 pb-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                            </div>
                            <div className="flex gap-4 overflow-hidden">
                                {[1, 2, 3, 4].map((j) => (
                                    <div key={j} className="min-w-[160px] md:min-w-[200px]">
                                        <ProductCardSkeleton />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-20">
                    <p className="text-red-500 font-medium">{error}</p>
                </div>
            ) : categoryProducts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 font-medium">No products available</p>
                </div>
            ) : (
                categoryProducts.map((categoryProduct, index) => (
                    <ProductSlider
                        key={categoryProduct.category.id}
                        title={categoryProduct.category.name}
                        products={categoryProduct.products}
                        viewAllLink={`/user/products?category=${categoryProduct.category.slug}`}
                        className={index > 0 ? "mt-4" : ""}
                    />
                ))
            )}
        </div>
    );
}
