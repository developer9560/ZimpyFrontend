'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/src/lib/constants';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';
import axios from 'axios';
import { categoryAPI } from '@/src/lib/api';
import { userCategory } from '@/src/types/category';

interface CategorySidebarProps {
    className?: string;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({ className }) => {
    const pathname = usePathname();
    // Extract current slug from pathname: /user/category/[slug]
    const currentSlug = pathname?.split('/').pop();
    const [categories, setCategories] = useState<userCategory[]>([]);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await categoryAPI.getCategories();
                setCategories(categories);
                console.log(categories);
            }
            catch (e) {
                console.log(e);
            }
        }
        fetchCategories();
    }, [])




    return (
        <div className={cn(
            "bg-white h-full flex flex-col",
            className
        )}>
            {categories.length > 0 ? (
                categories.map((category) => {
                    const isActive = currentSlug === category.slug;
                    return (
                        <Link
                            key={category.id}
                            href={`/user/category/${category.slug}`}
                            className={cn(
                                "flex flex-col md:flex-row items-center md:gap-4 p-3 md:px-4 md:py-4 border-b md:border-b-0 md:border-l-4 transition-all hover:bg-green-50 group",
                                isActive
                                    ? "bg-green-50 md:bg-green-50 border-green-500 md:border-l-[#10B981]"
                                    : "border-transparent text-gray-600"
                            )}
                        >
                            {/* Icon/Image Container */}
                            <div className={cn(
                                "w-12 h-12 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-gray-100 text-2xl md:text-xl mb-1 md:mb-0 transition-transform duration-200 group-hover:scale-110 overflow-hidden",
                                isActive && "bg-green-100"
                            )}>
                                {category.imageUrl ? (
                                    <img src={category.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span>📦</span>
                                )}
                            </div>

                            {/* Label */}
                            <span className={cn(
                                "text-[10px] md:text-sm font-medium text-center md:text-left leading-tight line-clamp-2 w-full md:w-auto",
                                isActive ? "text-green-700 font-bold" : "text-gray-700"
                            )}>
                                {category.name}
                            </span>
                        </Link>
                    );
                })
            ) : (
                <div className="p-4 text-center text-xs text-gray-400">Loading...</div>
            )}
        </div>
    );
};
