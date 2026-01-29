'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface SortDropdownProps {
    sortBy: 'newest' | 'price-asc' | 'price-desc';
    onSortChange: (sort: 'newest' | 'price-asc' | 'price-desc') => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ sortBy, onSortChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const sortOptions = [
        { value: 'newest' as const, label: 'Newest First' },
        { value: 'price-asc' as const, label: 'Price: Low to High' },
        { value: 'price-desc' as const, label: 'Price: High to Low' },
    ];

    const currentLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-[#10B981] transition-colors"
            >
                <span>{currentLabel}</span>
                <svg
                    className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        {sortOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onSortChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg",
                                    sortBy === option.value && "bg-green-50 text-[#10B981]"
                                )}
                            >
                                <span>{option.label}</span>
                                {sortBy === option.value && <Check size={16} strokeWidth={2.5} />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
