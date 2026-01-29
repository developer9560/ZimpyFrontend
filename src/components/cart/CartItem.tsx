'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '@/src/store/cartStore';
import { CartItem as CartItemType } from '@/src/types/cart';
import { cn, formatPrice } from '@/src/lib/utils';

interface CartItemProps {
    item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { updateQuantity, removeItem, isLoading } = useCartStore();
    const [isUpdating, setIsUpdating] = React.useState(false);

    const handleUpdateQuantity = async (newQuantity: number) => {
        setIsUpdating(true);
        await updateQuantity(item.productId, newQuantity);
        setIsUpdating(false);
    };

    const product = item.product;
    const image = product.images?.[0]?.imageUrl || '/placeholder.png';
    const sku = product.skus?.[0]; // Assuming first SKU for now if generic product item
    const stock = item.stock || sku?.stock || 0;

    const attributes = item.product.skus[0]; // Wait, frontend model needs update to receive attributes map
    // Actually, I added `attributes` map to backend CartItemResponse.
    // But frontend `CartItem` type hasn't been updated to include `attributes` inside the item root or product.
    // In `mapBackendCartToFrontend`, I should map this new field.

    // Let's modify this file to render attributes if they exist. 
    // I need to update types/cart.ts first to include `attributes?: Record<string, string>`.

    return (
        <div className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-white hover:shadow-sm transition-shadow">
            {/* Product Image */}
            <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-contain p-2"
                />
                {(item.discount || 0) > 0 && (
                    <span className="absolute top-0 left-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-br-md">
                        {Math.round(((item.discount || 0) / ((item.originalPrice || item.price) * item.quantity)) * 100)}% OFF
                    </span>
                )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col flex-1 justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <Link href={`/user/products/${product.id}`} className="text-sm font-medium text-gray-900 hover:text-green-600 line-clamp-2 transition-colors">
                            {product.name}
                        </Link>
                        <button
                            onClick={() => removeItem(item.productId)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            disabled={isLoading}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    {/* Variant Attributes */}
                    <div className="flex flex-wrap gap-2 mt-1">
                        {item.attributes && Object.entries(item.attributes).map(([key, value]) => (
                            <span key={key} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                <span className="font-medium text-gray-600">{key}:</span> {value}
                            </span>
                        ))}
                        {!item.attributes && (
                            <p className="text-xs text-gray-500">
                                {product.unit || (sku?.skuCode)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-end justify-between mt-2">
                    {/* Price */}
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</span>
                        {(item.originalPrice || 0) > item.price && (
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-400 line-through">{formatPrice(item.originalPrice || 0)}</span>
                                <span className="text-green-600 font-medium">Save {formatPrice((item.originalPrice || 0) - item.price)}</span>
                            </div>
                        )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex items-center border border-gray-200 rounded-lg h-9",
                            (isLoading || isUpdating) && "opacity-50 pointer-events-none"
                        )}>
                            <button
                                onClick={() => handleUpdateQuantity(item.quantity - 1)}
                                className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-green-600 rounded-l-lg transition-colors"
                            >
                                <Minus size={14} strokeWidth={2.5} />
                            </button>
                            <div className="w-8 h-full flex items-center justify-center text-sm font-bold text-gray-900 border-x border-gray-100 bg-gray-50">
                                {item.quantity}
                            </div>
                            <button
                                onClick={() => handleUpdateQuantity(item.quantity + 1)}
                                className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-green-600 rounded-r-lg transition-colors"
                                disabled={item.quantity >= stock}
                            >
                                <Plus size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
