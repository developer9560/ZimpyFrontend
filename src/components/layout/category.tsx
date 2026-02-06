
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { categoryAPI } from "@/src/lib/api";
import { userCategory } from "@/src/types/category";


const CategorySkeleton = () => (
    <div className="flex flex-col items-center p-2 rounded-xl animate-pulse">
        <div className="w-full aspect-square bg-gray-200 rounded-lg mb-2 shadow-sm"></div>
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
    </div>
);

export default function Category() {
    const [categories, setCategories] = useState<userCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            try {
                const response = await categoryAPI.getCategories();
                setCategories(response);
            }
            catch (e) {
                console.log(e);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCategories();
    }, [])

    return (
        <div className="container mx-auto px-4 md:px-0 py-4">
            <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2 sm:gap-3 md:gap-4 mt-4">
                {isLoading ? (
                    Array.from({ length: 12 }).map((_, i) => (
                        <CategorySkeleton key={i} />
                    ))
                ) : categories.length > 0 ? (
                    categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/user/category/${category.slug}`}
                            className="group flex flex-col items-center bg-[#D1FAE5] rounded-xl p-1 md:p-2 shadow-sm hover:shadow-md transition-all border border-transparent hover:border-[#10B981]/20 "
                        >
                            <div className="relative w-full aspect-square flex items-center justify-center bg-white rounded-lg mb-2 shadow-sm group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                {category.imageUrl ? (
                                    <Image
                                        src={category.imageUrl}
                                        alt={category.name}
                                        fill
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl filter drop-shadow-sm">📦</span>
                                )}
                            </div>
                            <div className="w-full text-center">
                                <h3 className="text-[10px] md:text-sm font-semibold text-gray-800 leading-tight line-clamp-2 md:line-clamp-1 group-hover:text-[#10B981] transition-colors">
                                    {category.name}
                                </h3>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-4 text-gray-500">
                        No categories found.
                    </div>
                )}
            </div>
        </div>
    );
}
