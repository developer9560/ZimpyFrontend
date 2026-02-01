'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CategorySidebar } from '@/src/components/category/CategorySidebar';
import { ProductGrid } from '@/src/components/product/ProductGrid';
import { SortDropdown } from '@/src/components/category/SortDropdown';
import { FilterPanel } from '@/src/components/category/FilterPanel';
import { productsAPI } from '@/src/lib/api';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import type { Product } from '@/src/types';

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const categorySlug = searchParams.get('category');

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState<string>('');

    // Filter & Sort State
    const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [showInStockOnly, setShowInStockOnly] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Fetch products by category
    useEffect(() => {
        const fetchProducts = async () => {
            if (!categorySlug) {
                setError('No category specified');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const response = await productsAPI.getByCategory(categorySlug);

                // Handle paginated response
                const productList = response.content || [];
                setProducts(productList);

                // Set category name from first product if available
                if (productList.length > 0 && productList[0].category) {
                    setCategoryName(productList[0].category.name);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [categorySlug]);

    // Sort products
    const sortedProducts = useMemo(() => {
        const sorted = [...products];
        switch (sortBy) {
            case 'price-asc':
                return sorted.sort((a, b) => {
                    const priceA = a.skus?.[0]?.price || 0;
                    const priceB = b.skus?.[0]?.price || 0;
                    return priceA - priceB;
                });
            case 'price-desc':
                return sorted.sort((a, b) => {
                    const priceA = a.skus?.[0]?.price || 0;
                    const priceB = b.skus?.[0]?.price || 0;
                    return priceB - priceA;
                });
            case 'newest':
            default:
                return sorted; // Backend already returns newest first
        }
    }, [products, sortBy]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return sortedProducts.filter(product => {
            const price = product.skus?.[0]?.price || 0;
            const stock = product.skus?.[0]?.stock || 0;

            // Price range filter
            if (price < priceRange[0] || price > priceRange[1]) return false;

            // Stock filter
            if (showInStockOnly && stock === 0) return false;

            return true;
        });
    }, [sortedProducts, priceRange, showInStockOnly]);

    const handleClearFilters = () => {
        setPriceRange([0, 10000]);
        setShowInStockOnly(false);
    };

    return (
        <div className='bg-[#F3F4F6]'>
            <div className="flex flex-row min-h-[calc(100vh-112px)] bg-[#F3F4F6]">
                {/* Sidebar Navigation */}
                <aside className="w-[80px] md:w-[280px] flex-shrink-0 bg-white border-r border-gray-200 sticky top-[122px] md:top-[80px] lg:top-[112px] h-[calc(100vh-122px)] md:h-[calc(100vh-80px)] lg:h-[calc(100vh-112px)] overflow-y-auto no-scrollbar z-10">
                    <CategorySidebar />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-0 md:p-6 overflow-y-auto w-full">
                    <div className="container mx-auto px-[0px] md:px-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0 py-4 md:py-0 bg-white md:bg-transparent sticky md:static top-0 z-20 border-b md:border-0">
                            <div>
                                <h1 className="text-lg md:text-2xl font-bold text-gray-800">
                                    {isLoading ? 'Loading...' : categoryName || 'Products'}
                                </h1>
                                <p className="text-xs md:text-sm text-gray-500">
                                    {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                                </p>
                            </div>

                            {/* Sort & Filter Buttons */}
                            <div className="flex items-center gap-2">
                                <div className="hidden md:block">
                                    <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
                                </div>
                                <button
                                    onClick={() => setIsFilterOpen(true)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-[#10B981] hover:border-[#10B981] transition-colors shadow-sm"
                                >
                                    <SlidersHorizontal size={16} />
                                    <span className="hidden md:inline">Filter</span>
                                </button>
                            </div>
                        </div>

                        {/* Mobile Sort Selector */}
                        <div className="md:hidden px-4 mb-4">
                            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-12 h-12 text-[#10B981] animate-spin mb-4" />
                                <p className="text-gray-500 font-medium">Loading products...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                <div className="text-6xl mb-4">⚠️</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
                                <p className="text-gray-500 text-center">{error}</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !error && filteredProducts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No products found</h3>
                                <p className="text-gray-500 text-center mb-4">
                                    Try adjusting your filters or check back later
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-6 py-2.5 bg-[#10B981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        {/* Product Grid */}
                        {!isLoading && !error && filteredProducts.length > 0 && (
                            <ProductGrid
                                products={filteredProducts}
                                columns={5}
                                cardVariant="mobile"
                                className="pb-20"
                            />
                        )}
                    </div>
                </main>
            </div>

            {/* Filter Panel */}
            <FilterPanel
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                showInStockOnly={showInStockOnly}
                onInStockChange={setShowInStockOnly}
                onClearFilters={handleClearFilters}
            />
        </div>
    );
}
