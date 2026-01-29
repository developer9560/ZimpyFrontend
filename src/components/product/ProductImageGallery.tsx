'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Zoom } from 'swiper/modules';
import { cn } from '@/src/lib/utils';
import type { ProductImage } from '@/src/types';
import { ZoomIn } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

interface ProductImageGalleryProps {
    images: ProductImage[];
    productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
    images,
    productName,
}) => {
    const [selectedImage, setSelectedImage] = useState<ProductImage>(images[0]);

    if (!images || images.length === 0) {
        return (
            <div className="w-full aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2">
                <div className="text-4xl">📦</div>
                <span className="text-gray-400 font-medium">No images available</span>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Mobile: Swiper Carousel */}
            <div className="md:hidden w-full bg-white rounded-xl border border-gray-100 overflow-hidden">
                <Swiper
                    modules={[Pagination, Zoom]}
                    pagination={{ clickable: true }}
                    zoom={true}
                    className="w-full aspect-square"
                >
                    {images.map((image, index) => (
                        <SwiperSlide key={image.id || index}>
                            <div className="swiper-zoom-container">
                                <div className="relative w-full h-full p-6">
                                    <Image
                                        src={image.imageUrl}
                                        alt={productName}
                                        fill
                                        className="object-contain"
                                        priority={index === 0}
                                    />
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Desktop: Sticky Gallery with Thumbnails */}
            <div className="hidden md:block sticky top-4">
                <div className="flex gap-4 h-[600px]">
                    {/* Vertical Thumbnails - Fixed width scrollable */}
                    <div className="w-24 flex flex-col gap-3 overflow-y-auto no-scrollbar py-1 pr-2">
                        {images.map((image, index) => (
                            <button
                                key={image.id || index}
                                onClick={() => setSelectedImage(image)}
                                className={cn(
                                    "relative w-full aspect-square rounded-lg border-2 overflow-hidden bg-white hover:border-[#10B981] transition-all flex-shrink-0",
                                    selectedImage.imageUrl === image.imageUrl
                                        ? "border-[#10B981] ring-2 ring-[#10B981]/20 shadow-md"
                                        : "border-gray-200 hover:shadow-sm"
                                )}
                            >
                                <Image
                                    src={image.imageUrl}
                                    alt={`${productName} thumbnail ${index + 1}`}
                                    fill
                                    className="object-contain p-1.5"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Main Image Area - Fixed height, properly constrained */}
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 relative overflow-hidden group shadow-sm h-full">
                        <div className="absolute inset-0 flex items-center justify-center p-12">
                            <div className="relative w-full h-full">
                                <Image
                                    src={selectedImage.imageUrl || images[0].imageUrl}
                                    alt={productName}
                                    fill
                                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>

                        {/* Zoom hint */}
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                <ZoomIn size={14} />
                                <span>Hover to zoom</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
