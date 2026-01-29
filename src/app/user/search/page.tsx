'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X, ChevronLeft, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { ProductGrid } from '@/src/components/product/ProductGrid';
import { CATEGORIES } from '@/src/lib/constants';
import { productsAPI } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/src/types';

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Update query if URL param changes
    useEffect(() => {
        const q = searchParams.get('q');
        if (q !== null && q !== query) {
            setQuery(q);
        }
    }, [searchParams]);

    // Handle Search Logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        const fetchResults = async () => {
            try {
                const response = await productsAPI.search(query);
                setResults(response.content || []);
            } catch (err) {
                console.error('Search failed:', err);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        inputRef.current?.focus();
        router.replace('/user/search');
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.replace(`/user/search?q=${encodeURIComponent(query)}`);
        }
    };

    const suggestedCategories = CATEGORIES.slice(0, 6);

    return (
        <div className="min-h-screen bg-white md:bg-gray-50 ">
            {/* Sticky Header with Search Input */}
            <div className="sticky top-0 left-0 right-0 z-50 bg-white py-4 shadow-sm ">
                <div className="container flex items-center justify-between mx-auto px-4 py-3 md:py-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 flex-shrink-0 p-2 "
                    >
                        <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">Z</span>
                        </div>
                        <span className=" sm:block text-2xl font-bold text-[#111827]">
                            Zimpy
                        </span>
                    </Link>
                    <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-3 w-full ">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="md:hidden p-1 -ml-2 text-gray-500 hover:text-gray-700"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="flex-1 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <SearchIcon size={20} />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                }}
                                placeholder="Search for bread, milk, eggs..."
                                className="w-full h-12 pl-12 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-base text-black focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none shadow-sm"
                            />
                            {query && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <X size={14} strokeWidth={3} />
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="hidden md:flex items-center justify-center h-12 px-6 bg-[#10B981] text-white font-semibold rounded-xl hover:bg-[#059669] transition-colors shadow-sm active:scale-95"
                        >
                            Search
                        </button>

                    </form>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-20 md:py-8">

                {/* State: No Query (Default View) */}
                {!query && (
                    <div className="mt-6 space-y-8 animate-fadeIn">
                        {/* Trending Categories */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                                    <TrendingUp size={16} />
                                    <span>Trending Categories</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
                                {suggestedCategories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/user/category/${cat.slug}`}
                                        className="group flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#10B981] transition-all"
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center text-3xl bg-gray-50 rounded-full group-hover:scale-110 transition-transform">
                                            {cat.icon}
                                        </div>
                                        <span className="text-xs md:text-sm font-medium text-gray-700 text-center line-clamp-2 md:line-clamp-1 group-hover:text-[#10B981]">
                                            {cat.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* State: Searching / Results */}
                {query && (
                    <div className="mt-4 md:mt-8">
                        {isSearching ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mb-4" />
                                <p className="text-gray-500 text-sm">Searching for &quot;{query}&quot;...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Results for &quot;{query}&quot;
                                    </h2>
                                    <span className="text-sm text-gray-500">{results.length} items found</span>
                                </div>
                                <ProductGrid
                                    products={results}
                                    columns={5}
                                    cardVariant="mobile"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                    <SearchIcon size={40} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
                                <p className="text-gray-500 max-w-xs mx-auto">
                                    We couldn&apos;t find any items matching &quot;{query}&quot;. Try searching for something else.
                                </p>
                                <button
                                    onClick={clearSearch}
                                    className="mt-6 px-6 py-2 bg-[#10B981] text-white font-medium rounded-lg hover:bg-[#059669] transition-colors"
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <SearchPageContent />
        </Suspense>
    );
}
