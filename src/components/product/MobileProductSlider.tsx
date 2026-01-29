'use client';

import React, { useId } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { MobileProductCard } from './MobileProductCard';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/src/types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

interface ProductSliderProps {
    title?: string;
    products: Product[];
    viewAllLink?: string;
    className?: string;
}

export const MobileProductSlider: React.FC<ProductSliderProps> = ({
    title,
    products,
    viewAllLink,
    className
}) => {
    // Generate a unique ID for this slider instance
    // We clean the ID to ensure it is a valid CSS selector (remove colons usually present in useId)
    const uniqueId = useId().replace(/:/g, '');
    const prevButtonClass = `swiper-button-prev-${uniqueId}`;
    const nextButtonClass = `swiper-button-next-${uniqueId}`;

    return (
        <div className={`w-full py-6 ${className || ''}`}>
            <div className="container mx-auto px-4 md:px-0">
                {/* Header */}
                {(title || viewAllLink) && (
                    <div className="flex items-center justify-between mb-4">
                        {title && (
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                                {title}
                            </h2>
                        )}
                        {viewAllLink && (
                            <Link
                                href={viewAllLink}
                                className="text-sm font-medium text-[#10B981] hover:text-[#059669] transition-colors flex items-center"
                            >
                                see all
                                <ChevronRight size={16} />
                            </Link>
                        )}
                    </div>
                )}

                {/* Slider */}
                <div className="relative group">
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={8}
                        slidesPerView={2}
                        navigation={{
                            nextEl: `.${nextButtonClass}`,
                            prevEl: `.${prevButtonClass}`,
                        }}
                        breakpoints={{
                            640: {
                                slidesPerView: 3,
                            },
                            768: {
                                slidesPerView: 4,
                            },
                            1024: {
                                slidesPerView: 5,
                            },
                            1280: {
                                slidesPerView: 6,
                            },
                        }}
                        className="product-slider relative !pb-1"
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product.id} className="h-auto">
                                <MobileProductCard product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    {/* Custom Navigation Buttons */}
                    <button className={`${prevButtonClass} absolute top-1/2 -left-4 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-300 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-gray-50 disabled:cursor-not-allowed`}>
                        <ChevronRight size={20} className="rotate-180" />
                    </button>
                    <button className={`${nextButtonClass} absolute top-1/2 -right-4 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-lg border border-gray-300 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hover:bg-gray-50 disabled:cursor-not-allowed`}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
