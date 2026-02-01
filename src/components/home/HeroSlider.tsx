'use client';

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import { publicApi } from '@/src/lib/api';
import { PublicBannerResponse } from '@/src/types/banner';
import axios from 'axios';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export const HeroSlider = () => {
    const [banners, setBanners] = useState<PublicBannerResponse[]>([]);
    const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [isLoading, setIsLoading] = useState(true);

    // Detect device type
    useEffect(() => {
        const updateDeviceType = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setDeviceType('mobile');
            } else if (width < 1024) {
                setDeviceType('tablet');
            } else {
                setDeviceType('desktop');
            }
        };

        updateDeviceType();
        window.addEventListener('resize', updateDeviceType);
        return () => window.removeEventListener('resize', updateDeviceType);
    }, []);

    // Fetch banners
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await publicApi.getBanners();
                if (response.success) {
                    setBanners(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch banners:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBanners();
    }, []);

    // Get appropriate image URL based on device, with fallback
    const getBannerImage = (banner: PublicBannerResponse): string | null => {
        // Try device-specific image first
        if (deviceType === 'mobile' && banner.mobileUrl) return banner.mobileUrl;
        if (deviceType === 'tablet' && banner.tabletUrl) return banner.tabletUrl;
        if (deviceType === 'desktop' && banner.desktopUrl) return banner.desktopUrl;

        // Fallback priority: desktop > tablet > mobile
        return banner.desktopUrl || banner.tabletUrl || banner.mobileUrl || null;
    };

    // Track click and navigate
    const handleBannerClick = async (bannerId: number, link: string) => {
        try {
            // Track click for analytics
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/public/banners/${bannerId}/click`
            );
        } catch (error) {
            console.error('Failed to track click:', error);
        }
        // Navigation will happen via Link component
    };

    if (isLoading) {
        return (
            <div className="w-full mb-8">
                <div className="container mx-auto px-4 md:px-0 py-4">
                    <div className="w-full rounded-xl overflow-hidden h-[160px] sm:h-[240px] md:h-[320px] lg:h-[380px] bg-gray-100 animate-pulse" />
                </div>
            </div>
        );
    }

    if (banners.length === 0) {
        return (
            <div className="w-full mb-8">
                <div className="container mx-auto px-4 md:px-0 py-4">
                    <div className="w-full rounded-xl overflow-hidden h-[160px] sm:h-[240px] md:h-[320px] lg:h-[380px] bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                        <div className="text-white text-center">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-2 sm:mb-4">Welcome to Zimpy</h2>
                            <p className="text-sm sm:text-lg md:text-xl">Fresh Groceries Delivered to Your Door</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mb-4">
            <div className="container mx-auto px-4 md:px-0 py-4">
                <Swiper
                    spaceBetween={16}
                    centeredSlides={true}
                    autoplay={{
                        delay: 3500,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                    }}
                    navigation={true}
                    loop={banners.length > 1}
                    modules={[Autoplay, Pagination, Navigation]}
                    className="w-full rounded-xl overflow-hidden hero-swiper"
                >
                    {banners.map((banner: PublicBannerResponse) => {
                        const imageUrl = getBannerImage(banner);

                        return (
                            <SwiperSlide key={banner.id}>
                                <Link
                                    href={banner.link || '#'}
                                    onClick={() => handleBannerClick(banner.id, banner.link)}
                                    className="block w-full h-full h-[160px] sm:h-[240px] md:h-[320px] relative cursor-pointer"
                                >
                                    {imageUrl ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={imageUrl}
                                                alt={banner.title}
                                                // width={1920}
                                                // height={300}
                                                fill
                                                priority
                                                className="object-contain w-full h-full rounded-xl"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                                                quality={90}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full h-[160px] sm:h-[240px] md:h-[320px] lg:h-[380px] bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center rounded-xl">
                                            <h3 className="text-black text-xl sm:text-3xl md:text-4xl font-bold">
                                                {banner.title}
                                            </h3>
                                        </div>
                                    )}
                                </Link>
                            </SwiperSlide>
                        );
                    })}

                    <style jsx global>{`
                        .hero-swiper .swiper-pagination-bullet-active {
                            background-color: #fff !important;
                        }
                        .hero-swiper .swiper-button-next, .hero-swiper .swiper-button-prev {
                            color: white !important;
                            text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                        }
                        .hero-swiper .swiper-button-next:after, .hero-swiper .swiper-button-prev:after {
                            font-size: 20px !important;
                            background: rgba(0,0,0,0.2);
                            width: 40px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            border-radius: 50%;
                            transition: background 0.2s;
                        }
                        .hero-swiper .swiper-button-next:hover:after, .hero-swiper .swiper-button-prev:hover:after {
                            background: rgba(0,0,0,0.5);
                        }
                        @media (max-width: 640px) {
                            .hero-swiper .swiper-button-next, .hero-swiper .swiper-button-prev {
                                display: none !important;
                            }
                        }
                    `}</style>
                </Swiper>
            </div>
        </div>
    );
};
