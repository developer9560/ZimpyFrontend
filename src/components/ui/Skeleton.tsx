'use client';

import React from 'react';
import { cn } from '@/src/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  ...props
}) => {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-gray-200',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      {...props}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn('bg-white rounded-xl p-4', className)}>
      {/* Image */}
      <Skeleton variant="rounded" className="w-full aspect-square mb-3" />

      {/* Brand/Category */}
      <Skeleton width="40%" height={12} variant="text" className="mb-2" />

      {/* Title */}
      <Skeleton width="100%" height={16} variant="text" className="mb-1" />
      <Skeleton width="70%" height={16} variant="text" className="mb-3" />

      {/* Rating */}
      <Skeleton width="30%" height={14} variant="text" className="mb-3" />

      {/* Price */}
      <div className="flex items-center gap-2 mb-3">
        <Skeleton width={60} height={20} variant="text" />
        <Skeleton width={40} height={14} variant="text" />
      </div>

      {/* Button */}
      <Skeleton width="100%" height={40} variant="rounded" />
    </div>
  );
};

// Product Grid Skeleton
interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export const ProductGridSkeleton: React.FC<ProductGridSkeletonProps> = ({
  count = 8,
  className,
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

// Category Card Skeleton
export const CategoryCardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center p-4', className)}>
      <Skeleton variant="circular" width={80} height={80} className="mb-3" />
      <Skeleton width={60} height={14} variant="text" />
    </div>
  );
};

// Cart Item Skeleton
export const CartItemSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn('flex gap-4 p-4 bg-white rounded-lg', className)}>
      <Skeleton variant="rounded" width={80} height={80} />
      <div className="flex-1">
        <Skeleton width="80%" height={16} variant="text" className="mb-2" />
        <Skeleton width="40%" height={14} variant="text" className="mb-3" />
        <div className="flex items-center justify-between">
          <Skeleton width={80} height={32} variant="rounded" />
          <Skeleton width={60} height={20} variant="text" />
        </div>
      </div>
    </div>
  );
};

// Order Card Skeleton
export const OrderCardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn('p-4 bg-white rounded-lg border', className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <Skeleton width={120} height={16} variant="text" className="mb-2" />
          <Skeleton width={80} height={14} variant="text" />
        </div>
        <Skeleton width={80} height={24} variant="rounded" />
      </div>
      <div className="flex gap-3 mb-4">
        <Skeleton variant="rounded" width={60} height={60} />
        <Skeleton variant="rounded" width={60} height={60} />
        <Skeleton variant="rounded" width={60} height={60} />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton width={100} height={14} variant="text" />
        <Skeleton width={120} height={36} variant="rounded" />
      </div>
    </div>
  );
};

// Text Line Skeleton
interface TextSkeletonProps {
  lines?: number;
  className?: string;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '60%' : '100%'}
          height={14}
          variant="text"
        />
      ))}
    </div>
  );
};

export default Skeleton;
