'use client';

import React from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    priceRange: [number, number];
    onPriceRangeChange: (range: [number, number]) => void;
    showInStockOnly: boolean;
    onInStockChange: (checked: boolean) => void;
    onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
    isOpen,
    onClose,
    priceRange,
    onPriceRangeChange,
    showInStockOnly,
    onInStockChange,
    onClearFilters,
}) => {
    const [localMinPrice, setLocalMinPrice] = React.useState(priceRange[0]);
    const [localMaxPrice, setLocalMaxPrice] = React.useState(priceRange[1]);

    const handleApply = () => {
        onPriceRangeChange([localMinPrice, localMaxPrice]);
        onClose();
    };

    React.useEffect(() => {
        setLocalMinPrice(priceRange[0]);
        setLocalMaxPrice(priceRange[1]);
    }, [priceRange]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={onClose}
            />

            {/* Filter Panel */}
            <div className={cn(
                "fixed md:static inset-x-0 bottom-0 md:bottom-auto bg-white rounded-t-2xl md:rounded-xl z-50 md:z-auto",
                "max-h-[80vh] md:max-h-none overflow-y-auto",
                "shadow-2xl md:shadow-lg border-t md:border border-gray-200",
                "animate-slide-up md:animate-none"
            )}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-2xl md:rounded-t-xl z-10">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={18} className="text-[#10B981]" />
                        <h3 className="font-bold text-gray-900">Filters</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Filter Content */}
                <div className="p-4 space-y-6">
                    {/* Price Range */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Price Range</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={localMinPrice}
                                    onChange={(e) => setLocalMinPrice(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none"
                                    placeholder="Min"
                                />
                                <span className="text-gray-400">to</span>
                                <input
                                    type="number"
                                    value={localMaxPrice}
                                    onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] outline-none"
                                    placeholder="Max"
                                />
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>₹{localMinPrice}</span>
                                <span>₹{localMaxPrice}</span>
                            </div>
                        </div>
                    </div>

                    {/* Availability */}
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Availability</h4>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={showInStockOnly}
                                onChange={(e) => onInStockChange(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-[#10B981] focus:ring-[#10B981] cursor-pointer"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-[#10B981] transition-colors">
                                In Stock Only
                            </span>
                        </label>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
                    <button
                        onClick={() => {
                            onClearFilters();
                            onClose();
                        }}
                        className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2.5 bg-[#10B981] rounded-lg text-sm font-bold text-white hover:bg-[#059669] transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </>
    );
};
