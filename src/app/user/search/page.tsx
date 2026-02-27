'use client';

import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X, ChevronLeft, TrendingUp, SlidersHorizontal, ChevronUp, Check } from 'lucide-react';
import { ProductGrid } from '@/src/components/product/ProductGrid';
import { CATEGORIES, PRICE_RANGES } from '@/src/lib/constants';
import { productsAPI } from '@/src/lib/api';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/src/types';
import { useSearchAutocomplete } from '@/src/hooks/useSearchAutocomplete';
import { useInfiniteScroll } from '@/src/hooks/useInfiniteScroll';

const PRODUCTS_PER_PAGE = 12;

interface PriceFilter {
    min: number;
    max: number;
}

function SearchPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    // Search state
    const [query, setQuery] = useState(initialQuery);
    const [inputValue, setInputValue] = useState(initialQuery);
    const [results, setResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

    // Pagination state
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Filter state
    const [priceFilter, setPriceFilter] = useState<PriceFilter | null>(null);
    const [customMinPrice, setCustomMinPrice] = useState('');
    const [customMaxPrice, setCustomMaxPrice] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [tempPriceFilter, setTempPriceFilter] = useState<PriceFilter | null>(null);

    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Autocomplete hook
    const { suggestions } = useSearchAutocomplete(inputValue, {
        debounceMs: 300,
        limit: 8,
        minQueryLength: 2,
    });

    // Infinite scroll
    const loadMoreRef = useInfiniteScroll(
        () => {
            if (hasMore && !isFetchingMore && query.trim() && results.length > 0) {
                loadMoreProducts();
            }
        },
        { threshold: 0.8, enabled: hasMore && !isFetchingMore }
    );

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Update query if URL param changes
    useEffect(() => {
        const q = searchParams.get('q');
        if (q !== null && q !== query) {
            setQuery(q);
            setInputValue(q);
        }
    }, [searchParams]);

    // Scroll listener for scroll-to-top button
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Main search handler
    const performSearch = useCallback(async (searchQuery: string, pageNum: number = 0, append: boolean = false) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setHasMore(false);
            return;
        }

        if (!append) {
            setIsSearching(true);
        } else {
            setIsFetchingMore(true);
        }

        try {
            const filters: any = {
                page: pageNum,
                limit: PRODUCTS_PER_PAGE,
            };

            if (priceFilter) {
                filters.minPrice = priceFilter.min;
                if (priceFilter.max !== Infinity) {
                    filters.maxPrice = priceFilter.max;
                }
            }

            const response = await productsAPI.search(searchQuery, filters);

            if (append) {
                setResults(prev => [...prev, ...(response.content || [])]);
            } else {
                setResults(response.content || []);
            }

            setHasMore(!response.last && response.content.length > 0);
            setPage(pageNum);
        } catch (err) {
            console.error('Search failed:', err);
            if (!append) {
                setResults([]);
            }
            setHasMore(false);
        } finally {
            setIsSearching(false);
            setIsFetchingMore(false);
        }
    }, [priceFilter]);

    // Load more products
    const loadMoreProducts = useCallback(() => {
        const nextPage = page + 1;
        performSearch(query, nextPage, true);
    }, [query, page, performSearch]);

    // Trigger search when query or filters change
    useEffect(() => {
        if (query.trim()) {
            setPage(0);
            performSearch(query, 0, false);
        } else {
            setResults([]);
            setHasMore(false);
        }
    }, [query, priceFilter, performSearch]);

    const clearSearch = () => {
        setQuery('');
        setInputValue('');
        setResults([]);
        setHasMore(false);
        setPriceFilter(null);
        setPage(0);
        inputRef.current?.focus();
        router.replace('/user/search');
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setQuery(inputValue);
            setShowSuggestions(false);
            setPage(0);
            router.replace(`/user/search?q=${encodeURIComponent(inputValue)}`);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        setShowSuggestions(value.length >= 2);
        setSelectedSuggestionIndex(-1);
    };

    const handleInputFocus = () => {
        if (inputValue.length >= 2) {
            setShowSuggestions(true);
        }
    };

    const handleSuggestionClick = (product: Product) => {
        router.push(`/user/products/${product.id}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) {
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestionIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedSuggestionIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedSuggestionIndex]);
                } else {
                    handleSearchSubmit(e);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
                break;
        }
    };

    const applyPriceFilter = (min: number, max: number) => {
        setPriceFilter({ min, max });
        setTempPriceFilter({ min, max });
        setShowFilters(false);
        setPage(0);
    };

    const applyCustomPriceFilter = () => {
        const min = parseFloat(customMinPrice) || 0;
        const max = parseFloat(customMaxPrice) || Infinity;
        if (min <= max) {
            applyPriceFilter(min, max);
        }
    };

    const clearFilters = () => {
        setPriceFilter(null);
        setTempPriceFilter(null);
        setCustomMinPrice('');
        setCustomMaxPrice('');
        setPage(0);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const suggestedCategories = CATEGORIES.slice(0, 6);
    const filteredResults = results;

    return (
        <div className="min-h-screen bg-white md:bg-gray-50">
            {/* Sticky Header with Search Input */}
            <div className="sticky top-0 left-0 right-0 z-50 bg-white shadow-sm">
                <div className="container flex flex-col md:flex-row justify-between mx-auto px-4 py-3 md:py-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 flex-shrink-0 p-2"
                    >
                        <div className="w-10 h-10 bg-[#10B981] rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">Z</span>
                        </div>
                        <span className="sm:block text-2xl font-bold text-[#111827]">
                            Zimpy
                        </span>
                    </Link>

                    <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-3 w-full">
                        <div className="flex-1 relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                                <SearchIcon size={20} />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                onKeyDown={handleKeyDown}
                                placeholder="Search for bread, milk, eggs..."
                                className="w-full h-12 pl-12 pr-10 rounded-xl border border-gray-200 bg-gray-50 text-base text-black focus:bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none shadow-sm"
                            />
                            {inputValue && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
                                >
                                    <X size={14} strokeWidth={3} />
                                </button>
                            )}

                            {/* Autocomplete Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div
                                    ref={suggestionsRef}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto"
                                >
                                    {suggestions.map((product, index) => {
                                        const sku = product.skus?.[0];
                                        const price = sku?.price || 0;
                                        const imageUrl = product.images?.[0]?.imageUrl;

                                        return (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => handleSuggestionClick(product)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-b-0",
                                                    selectedSuggestionIndex === index && "bg-gray-100"
                                                )}
                                            >
                                                <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden relative">
                                                    {imageUrl ? (
                                                        <Image
                                                            src={imageUrl}
                                                            alt={product.name}
                                                            fill
                                                            className="object-contain p-1"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            📦
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-sm text-[#10B981] font-semibold">
                                                        ₹{price}
                                                    </p>
                                                </div>
                                                <SearchIcon size={16} className="text-gray-400 flex-shrink-0" />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {showSuggestions && inputValue.length >= 2 && suggestions.length === 0 && (
                                <div
                                    ref={suggestionsRef}
                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50"
                                >
                                    <p className="text-sm text-gray-500 text-center">
                                        No suggestions found
                                    </p>
                                </div>
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
                {/* Filter Button (Mobile) */}
                {query && (
                    <div className="md:hidden flex items-center gap-2 mb-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <SlidersHorizontal size={18} />
                            <span className="text-sm font-medium">Filters</span>
                            {priceFilter && (
                                <span className="bg-[#10B981] text-white text-xs px-2 py-0.5 rounded-full">1</span>
                            )}
                        </button>
                        {priceFilter && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-[#10B981] font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                )}

                {/* Main Content */}
                <div className="flex gap-6">
                    {/* Filter Sidebar (Desktop) */}
                    {query && (
                        <div className="hidden md:block w-64 flex-shrink-0">
                            <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-gray-900">Filters</h3>
                                    {priceFilter && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-sm text-[#10B981] font-medium hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                {/* Price Filter */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-sm text-gray-700">Price Range</h4>
                                    <div className="space-y-2">
                                        {PRICE_RANGES.map((range) => (
                                            <button
                                                key={range.label}
                                                onClick={() => applyPriceFilter(range.min, range.max)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all",
                                                    priceFilter?.min === range.min && priceFilter?.max === range.max
                                                        ? "border-[#10B981] bg-[#F0FDF4] text-[#10B981] font-medium"
                                                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                                                )}
                                            >
                                                <span>{range.label}</span>
                                                {priceFilter?.min === range.min && priceFilter?.max === range.max && (
                                                    <Check size={16} />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Range */}
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-xs text-gray-600 mb-2">Custom Range</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={customMinPrice}
                                                onChange={(e) => setCustomMinPrice(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none"
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={customMaxPrice}
                                                onChange={(e) => setCustomMaxPrice(e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={applyCustomPriceFilter}
                                            className="w-full mt-2 px-3 py-1.5 bg-[#10B981] text-white text-sm font-medium rounded-lg hover:bg-[#059669] transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Area */}
                    <div className="flex-1">
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
                            <div className="mt-4 md:mt-0">
                                {/* Active Filters */}
                                {priceFilter && (
                                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                                        <span className="text-sm text-gray-600">Active filters:</span>
                                        <div className="flex items-center gap-1 px-3 py-1 bg-[#F0FDF4] border border-[#10B981] text-[#10B981] rounded-full text-sm">
                                            <span>
                                                ₹{priceFilter.min} - {priceFilter.max === Infinity ? '∞' : `₹${priceFilter.max}`}
                                            </span>
                                            <button
                                                onClick={clearFilters}
                                                className="ml-1 hover:bg-[#10B981] hover:text-white rounded-full p-0.5 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isSearching ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="w-8 h-8 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-gray-500 text-sm">Searching for &quot;{query}&quot;...</p>
                                    </div>
                                ) : filteredResults.length > 0 ? (
                                    <div className="space-y-4 animate-fadeIn">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-lg font-bold text-gray-900">
                                                Results for &quot;{query}&quot;
                                            </h2>
                                            <span className="text-sm text-gray-500">{filteredResults.length}+ items found</span>
                                        </div>
                                        <ProductGrid
                                            products={filteredResults}
                                            columns={5}
                                            cardVariant="mobile"
                                        />

                                        {/* Loading More Indicator */}
                                        {isFetchingMore && (
                                            <div className="flex justify-center py-8">
                                                <div className="w-6 h-6 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}

                                        {/* Infinite Scroll Trigger */}
                                        {hasMore && !isFetchingMore && (
                                            <div ref={loadMoreRef} className="h-20" />
                                        )}

                                        {/* End of Results */}
                                        {!hasMore && filteredResults.length > 0 && (
                                            <div className="text-center py-8 text-gray-500 text-sm">
                                                <p>No more products to load</p>
                                            </div>
                                        )}
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
            </div>

            {/* Mobile Filter Modal */}
            {showFilters && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Price Filter */}
                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm text-gray-700">Price Range</h4>
                            <div className="space-y-2">
                                {PRICE_RANGES.map((range) => (
                                    <button
                                        key={range.label}
                                        onClick={() => applyPriceFilter(range.min, range.max)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-all",
                                            tempPriceFilter?.min === range.min && tempPriceFilter?.max === range.max
                                                ? "border-[#10B981] bg-[#F0FDF4] text-[#10B981] font-medium"
                                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                                        )}
                                    >
                                        <span>{range.label}</span>
                                        {tempPriceFilter?.min === range.min && tempPriceFilter?.max === range.max && (
                                            <Check size={18} />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Range */}
                            <div className="pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-600 mb-2">Custom Range</p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={customMinPrice}
                                        onChange={(e) => setCustomMinPrice(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={customMaxPrice}
                                        onChange={(e) => setCustomMaxPrice(e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none"
                                    />
                                </div>
                                <button
                                    onClick={applyCustomPriceFilter}
                                    className="w-full mt-3 px-4 py-2.5 bg-[#10B981] text-white text-sm font-medium rounded-lg hover:bg-[#059669] transition-colors"
                                >
                                    Apply Custom Range
                                </button>
                            </div>
                        </div>

                        {priceFilter && (
                            <button
                                onClick={clearFilters}
                                className="w-full mt-4 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-40 p-3 bg-[#10B981] text-white rounded-full shadow-lg hover:bg-[#059669] transition-all active:scale-95"
                >
                    <ChevronUp size={24} />
                </button>
            )}
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
