'use client';

import React, { useState, useEffect } from 'react';
import { Minus, Plus, Clock, ShieldCheck, Star, Check } from 'lucide-react';
import { cn, formatPrice } from '@/src/lib/utils';
import { useCartStore } from '@/src/store/cartStore';
import { productsAPI } from '@/src/lib/api';
import type { Product, ProductSku, ProductVariants, SkuVariant } from '@/src/types';

interface ProductInfoProps {
    product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
    const { addItem, updateQuantity, getItemQuantity, isInCart } = useCartStore();

    const [selectedSku, setSelectedSku] = useState<ProductSku | undefined>(product.skus?.[0]);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<number, number>>({});
    const [variantData, setVariantData] = useState<ProductVariants | null>(null);
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);

    const quantity = getItemQuantity(product.id);
    const price = selectedSku?.price || 0;
    const originalPrice = selectedSku?.mrp || price;
    const stock = selectedSku?.stock || 0;
    const isOutOfStock = stock === 0;

    const discountPercentage = originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    // Fetch variant data on mount
    useEffect(() => {
        const fetchVariants = async () => {
            try {
                setIsLoadingVariants(true);
                const data = await productsAPI.getProductVariants(product.id);
                setVariantData(data);

                // Initialize selected attributes AND selected SKU from first variant
                if (data.skuVariants.length > 0) {
                    const firstVariant = data.skuVariants[0];
                    setSelectedAttributes(firstVariant.attributeValues);

                    // Find and set the matching product SKU
                    const matchingProductSku = product.skus?.find(s => s.id === firstVariant.skuId);
                    if (matchingProductSku) {
                        setSelectedSku(matchingProductSku);
                        console.log('Initialized with SKU:', firstVariant.skuId, 'Price:', matchingProductSku.price);
                    }
                }
            } catch (err) {
                console.error('Failed to load variants:', err);
            } finally {
                setIsLoadingVariants(false);
            }
        };

        // if (product.skus && product.skus.length > 1) {
        fetchVariants();
        // }
    }, [product.id, product.skus]);

    // When user selects an attribute value, find the matching SKU
    const handleAttributeSelect = (attributeId: number, valueId: number) => {
        const newSelection = {
            ...selectedAttributes,
            [attributeId]: valueId
        };
        setSelectedAttributes(newSelection);

        // Find SKU that EXACTLY matches the selected attribute combination
        if (variantData) {
            const matchingSku = variantData.skuVariants.find(variant => {
                const variantAttrs = variant.attributeValues;
                const selectionKeys = Object.keys(newSelection);
                const variantKeys = Object.keys(variantAttrs);

                // Must have same number of attributes
                if (selectionKeys.length !== variantKeys.length) {
                    return false;
                }

                // All attributes must match exactly
                return selectionKeys.every(attrId => {
                    const numAttrId = Number(attrId);
                    return variantAttrs[numAttrId] === newSelection[numAttrId];
                });
            });

            if (matchingSku) {
                // Update selected SKU from product.skus array
                const productSku = product.skus?.find(s => s.id === matchingSku.skuId);
                if (productSku) {
                    setSelectedSku(productSku);
                    console.log('Selected SKU:', matchingSku.skuId, 'Price:', productSku.price, 'Stock:', productSku.stock);
                }
            } else {
                console.warn('No matching SKU found for selection:', newSelection);
            }
        }
    };

    const handleIncrement = () => {
        if (quantity < stock) updateQuantity(product.id, quantity + 1);
    };

    const handleDecrement = () => {
        if (quantity > 0) updateQuantity(product.id, quantity - 1);
    };

    const handleAddToCart = () => {
        if (!isOutOfStock) addItem(product, 1);
    };

    const hasVariants = variantData && variantData.attributes && variantData.attributes.length > 0;

    return (
        <div className="flex flex-col gap-6">
            {/* Breadcrumb */}
            {/* <div className="text-sm text-gray-500 font-medium">
                Home / {product.category?.name || 'Products'} / <span className="text-gray-900">{product.name}</span>
            </div> */}

            {/* Title & Rating */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3">
                    {product.name}
                </h1>
                <div className="flex items-center gap-4 flex-wrap">
                    {product.rating && (
                        <div className="flex items-center gap-1.5 bg-[#10B981] text-white px-2.5 py-1 rounded-md">
                            <Star size={14} className="fill-white" />
                            <span className="text-sm font-bold">{product.rating}</span>
                        </div>
                    )}
                    {product.reviewCount && product.reviewCount > 0 && (
                        <span className="text-sm text-gray-500">
                            {product.reviewCount} ratings
                        </span>
                    )}
                    {/* <div className="inline-block bg-gray-100 px-3 py-1 rounded-lg text-sm font-semibold text-gray-700">
                        {product.unit || selectedSku?.skuCode || 'Default'}
                    </div> */}
                </div>
            </div>

            {/* Variant Selector - Attribute-based */}
            {hasVariants && !isLoadingVariants && (
                <div className="space-y-5">
                    {variantData.attributes.map((attribute) => (
                        <div key={attribute.attributeId} className="pb-5 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
                                {attribute.attributeName}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {attribute.options.map((option) => {
                                    const isSelected = selectedAttributes[attribute.attributeId] === option.valueId;

                                    return (
                                        <button
                                            key={option.valueId}
                                            onClick={() => handleAttributeSelect(attribute.attributeId, option.valueId)}
                                            className={cn(
                                                "relative px-4 py-2.5 rounded-lg border-2 font-medium text-sm transition-all",
                                                isSelected
                                                    ? "border-[#10B981] bg-[#F0FDF4] text-[#10B981]"
                                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {isSelected && <Check size={16} strokeWidth={3} />}
                                                <span>{option.value}</span>
                                            </div>
                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#10B981] rounded-full flex items-center justify-center">
                                                    <Check size={12} className="text-white" strokeWidth={3} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {selectedSku && (
                        <p className="text-xs text-gray-500 -mt-2">
                            {selectedSku.stock > 0
                                ? `${selectedSku.stock} units available`
                                : 'Out of stock'}
                        </p>
                    )}
                </div>
            )}

            {/* Price & Discount */}
            <div className="flex flex-col">
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">
                        {formatPrice(price)}
                    </span>
                    {originalPrice > price && (
                        <>
                            <span className="text-lg text-gray-400 line-through font-medium">
                                {formatPrice(originalPrice)}
                            </span>
                            <span className="px-2.5 py-1 bg-[#3B82F6] text-white text-xs font-bold rounded-md">
                                {discountPercentage}% OFF
                            </span>
                        </>
                    )}
                </div>
                <span className="text-xs text-gray-500 mt-2">(Inclusive of all taxes)</span>
            </div>



            {/* Add to Cart Section */}
            <div className="flex items-center gap-4 pt-2">
                {isInCart(product.id) && quantity > 0 ? (
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex-1 md:w-40 h-14 flex items-center justify-between bg-[#10B981] rounded-xl shadow-md">
                            <button
                                onClick={handleDecrement}
                                className="w-14 h-full flex items-center justify-center text-white active:bg-black/10 transition-colors rounded-l-xl"
                            >
                                <Minus size={20} strokeWidth={3} />
                            </button>
                            <span className="text-white text-xl font-bold">{quantity}</span>
                            <button
                                onClick={handleIncrement}
                                disabled={quantity >= stock}
                                className="w-14 h-full flex items-center justify-center text-white active:bg-black/10 transition-colors rounded-r-xl disabled:opacity-50"
                            >
                                <Plus size={20} strokeWidth={3} />
                            </button>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                            Added to cart
                        </span>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        className={cn(
                            "w-full md:w-auto px-12 h-14 rounded-xl text-base font-bold border-2 transition-all active:scale-95 uppercase tracking-wider shadow-lg",
                            isOutOfStock
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                : "bg-[#10B981] border-[#10B981] text-white hover:bg-[#059669] hover:border-[#059669] shadow-emerald-200"
                        )}
                    >
                        {isOutOfStock ? "Out of Stock" : "ADD TO CART"}
                    </button>
                )}
            </div>

            {/* Trust Signals */}
            {/* <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="p-2.5 bg-white rounded-lg shadow-sm">
                        <Clock size={20} className="text-[#10B981]" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-0.5">10 MINS</h4>
                        <p className="text-[10px] text-gray-500 leading-tight">Fastest delivery</p>
                    </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="p-2.5 bg-white rounded-lg shadow-sm">
                        <ShieldCheck size={20} className="text-[#10B981]" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-0.5">GENUINE</h4>
                        <p className="text-[10px] text-gray-500 leading-tight">Quality assured</p>
                    </div>
                </div>
            </div> */}
            {/* Summary */}
            {product.summary && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                    <p className="text-sm text-blue-800 leading-relaxed">
                        {product.summary}
                    </p>
                </div>
            )}
        </div>
    );
};
