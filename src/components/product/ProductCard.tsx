'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Star, ImageIcon } from 'lucide-react';
import { cn, formatPrice } from '@/src/lib/utils';
import { useCartStore } from '@/src/store/cartStore';
import { productsAPI } from '@/src/lib/api';
import type { Product } from '@/src/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addItem, updateQuantity, getItemQuantity, isInCart } = useCartStore();
  const [hasMounted, setHasMounted] = useState(false);
  const [displayUnit, setDisplayUnit] = useState<string>('');

  useEffect(() => {
    setHasMounted(true);

    // Fetch first attribute value for this product
    const fetchFirstAttribute = async () => {
      try {
        const variantData = await productsAPI.getProductVariants(product.id);

        // Get the first attribute's first value
        if (variantData.attributes && variantData.attributes.length > 0) {
          const firstAttribute = variantData.attributes[0];
          if (firstAttribute.options && firstAttribute.options.length > 0) {
            setDisplayUnit(firstAttribute.options[0].value);
          }
        }
      } catch (err) {
        // Fallback to product.unit or SKU code if variant fetch fails
        console.error('Failed to fetch variant:', err);
      }
    };

    // Only fetch if product has multiple SKUs (indicating variants)
    if (product.skus && product.skus.length > 1) {
      fetchFirstAttribute();
    } else if (product.unit) {
      setDisplayUnit(product.unit);
    }
  }, [product.id, product.skus, product.unit]);

  const quantity = getItemQuantity(product.id);
  const sku = product.skus?.[0];
  const price = sku?.price || 0;
  const originalPrice = sku?.mrp || price;
  const stock = sku?.stock || 0;
  const isOutOfStock = stock === 0;

  const discountPercentage = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) addItem(product, 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity < stock) updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 0) updateQuantity(product.id, quantity - 1);
  };

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <Link
      href={`/user/products/${product.id}`}
      className={cn(
        'group flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden h-full hover:shadow-lg transition-all duration-300 hover:border-[#10B981]/30',
        className
      )}
    >
      <div className="relative aspect-square p-4 bg-white overflow-hidden">
        {discountPercentage > 0 && (
          <div className="absolute top-0 left-0 bg-[#3B82F6] text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">
            {discountPercentage}% OFF
          </div>
        )}

        <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
          {primaryImage ? (
            <Image
              src={primaryImage.imageUrl || '/placeholder.png'}
              alt={product.name}
              fill
              className="object-contain p-2"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <ImageIcon className="text-gray-200" size={32} />
            </div>
          )}
        </div>

        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm text-[9px] font-bold text-gray-600">
          <Star size={10} className="fill-yellow-400 text-yellow-400" />
          <span>4.5</span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-3 pt-0">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1 min-h-[40px] group-hover:text-[#10B981] transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-4 font-medium">
          {displayUnit || product.unit || 'Default'}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            {originalPrice > price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          <div className="w-[70px] h-[32px]">
            {hasMounted && isInCart(product.id) && quantity > 0 ? (
              <div className="w-full h-full flex items-center justify-between bg-[#10B981] rounded-lg shadow-sm">
                <button
                  onClick={handleDecrement}
                  className="w-full h-full flex items-center justify-center text-white active:bg-black/10 rounded-l-lg"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="text-white text-xs font-bold">{quantity}</span>
                <button
                  onClick={handleIncrement}
                  className="w-full h-full flex items-center justify-center text-white active:bg-black/10 rounded-r-lg"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={cn(
                  "w-full h-full rounded-lg text-xs font-extrabold border-2 transition-all active:scale-95 uppercase tracking-wide",
                  isOutOfStock
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#F0FDF4] border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white"
                )}
              >
                {isOutOfStock ? "OOS" : "ADD"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
