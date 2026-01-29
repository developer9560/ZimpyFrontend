'use client';

import { useEffect, useState } from 'react';
import { HeroSlider } from '@/src/components/home/HeroSlider';
import "./globals.css";
import Category from '@/src/components/layout/category';
import { ProductSlider } from '@/src/components/product/ProductSlider';
import { productsAPI } from '@/src/lib/api';
import type { CategoryProduct } from '@/src/types';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
    const [categoryProducts, setCategoryProducts] = useState<CategoryProduct[]>([]);
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
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-12 h-12 text-[#10B981] animate-spin" />
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
