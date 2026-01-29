'use client';

import React from 'react';
import { cn } from '@/src/lib/utils';
import { MobileProductCard } from './MobileProductCard';
import { ProductCard } from './ProductCard';
import { Product } from '@/src/types';
import { ProductGridSkeleton } from '../ui/Skeleton';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  className?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
  showWishlist?: boolean;
  wishlistedIds?: string[];
  onWishlistClick?: (product: Product) => void;
  cardVariant?: 'default' | 'mobile'; // New prop to switch card type
}

const columnStyles = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
};

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  className,
  columns = 4,
  showWishlist = true,
  wishlistedIds = [],
  onWishlistClick,
  cardVariant = 'default',
}) => {
  if (isLoading) {
    return <ProductGridSkeleton count={columns * 2} />;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🛒</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-500 text-sm max-w-sm">
          We couldn&apos;t find any products matching your criteria.
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid gap-2 md:gap-4', columnStyles[columns], className)}>
      {products.map((product) => (
        cardVariant === 'mobile' ? (
          <MobileProductCard
            key={product.id}
            product={product}
            showWishlist={showWishlist}
            isWishlisted={wishlistedIds.includes(product.id)}
            onWishlistClick={onWishlistClick}
          />
        ) : (
          <ProductCard
            key={product.id}
            product={product}
            showWishlist={showWishlist}
            isWishlisted={wishlistedIds.includes(product.id)}
            onWishlistClick={onWishlistClick}
          />
        )
      ))}
    </div>
  );
};

export default ProductGrid;
