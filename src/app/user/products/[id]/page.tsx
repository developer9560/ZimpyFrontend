'use client';

import React, { useState, useEffect, use } from 'react';
import { ProductImageGallery } from '@/src/components/product/ProductImageGallery';
import { ProductInfo } from '@/src/components/product/ProductInfo';
import { ProductDetails } from '@/src/components/product/ProductDetails';
import { ProductSlider } from '@/src/components/product/ProductSlider';
import { notFound } from 'next/navigation';
import api from '@/src/lib/api';
import type { Product } from '@/src/types';
import { Loader2 } from 'lucide-react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/public/products/id/${id}`);
                setProduct(response.data);

                // Fetch similar products
                if (response.data.slug) {
                    const similarRes = await api.get(`/public/products/${response.data.slug}/similar`);
                    setSimilarProducts(similarRes.data);
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-[#10B981] animate-spin" />
                    <p className="text-gray-500 font-medium animate-pulse">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return notFound();
    }

    return (
        <div className="bg-[#F9FAFB] min-h-screen pb-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-4 md:pt-6 max-w-7xl">

                {/* Main Grid: Sticky Gallery + Scrollable Info */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Left: Image Gallery - Sticky on desktop */}
                        <div className="w-full p-4 md:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
                            <ProductImageGallery
                                images={product.images && product.images.length > 0 ? product.images : [{ id: 0, imageUrl: '/placeholder.png', isPrimary: true, sortOrder: 0 }]}
                                productName={product.name}
                            />
                        </div>

                        {/* Right: Product Info - Scrollable */}
                        <div className="w-full p-4 md:p-6 lg:p-8 overflow-y-auto max-h-screen">
                            <ProductInfo product={product} />

                            <div className="my-8 h-px bg-gray-100" />

                            <ProductDetails
                                productDetails={product.productDetails || []}
                                features={[
                                    'Premium Quality Guarantee',
                                    'Sourced directly from certified suppliers',
                                    'Safe and Hygienic Packaging',
                                    '100% Genuine Product'
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Similar Products Slider */}
                {similarProducts.length > 0 && (
                    <div className="mt-12">
                        <ProductSlider
                            title="You Might Also Like"
                            products={similarProducts}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
