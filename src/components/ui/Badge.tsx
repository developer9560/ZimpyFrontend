'use client';

import React from 'react';
import { cn } from '@/src/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'discount' | 'sale';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    rounded?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    discount: 'bg-[#FEF3C7] text-[#92400E]',
    sale: 'bg-[#EF4444] text-white font-semibold',
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
    className,
    variant = 'default',
    size = 'md',
    rounded = false,
    children,
    ...props
}) => {
    return (
        <span
            className={cn(
                'inline-flex items-center justify-center font-medium',
                variantStyles[variant],
                sizeStyles[size],
                rounded ? 'rounded-full' : 'rounded',
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

// Discount Badge Component
interface DiscountBadgeProps {
    percentage: number;
    className?: string;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({
    percentage,
    className,
}) => {
    if (percentage <= 0) return null;

    return (
        <Badge
            variant="sale"
            size="sm"
            className={cn('absolute top-2 left-2 z-10', className)}
        >
            {percentage}% OFF
        </Badge>
    );
};

// Stock Badge Component
interface StockBadgeProps {
    stock: number;
    className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ stock, className }) => {
    if (stock > 10) return null;

    if (stock === 0) {
        return (
            <Badge variant="error" size="sm" className={className}>
                Out of Stock
            </Badge>
        );
    }

    return (
        <Badge variant="warning" size="sm" className={className}>
            Only {stock} left
        </Badge>
    );
};

// Rating Badge Component
interface RatingBadgeProps {
    rating: number;
    reviewCount?: number;
    className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
    rating,
    reviewCount,
    className,
}) => {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
                rating >= 4
                    ? 'bg-green-100 text-green-700'
                    : rating >= 3
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700',
                className
            )}
        >
            <span>★</span>
            <span>{rating.toFixed(1)}</span>
            {reviewCount !== undefined && (
                <span className="text-gray-500">({reviewCount})</span>
            )}
        </span>
    );
};

export default Badge;
