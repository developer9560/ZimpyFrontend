// Cart Types

import { Product } from './product';

export interface CartItem {
    id: string;
    productId: number;
    product: Product;
    quantity: number;
    price: number;
    originalPrice?: number;
    discount?: number;
    total: number;
    stock?: number;
    attributes?: Record<string, string>;
}

export interface Cart {
    id?: string;
    userId?: string;
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    discount: number;
    deliveryCharges: number;
    total: number;
    appliedCoupon?: {
        code: string;
        discount: number;
    };
    updatedAt?: string;
}

export interface AddToCartData {
    productId: number;
    skuId: number;
    quantity: number;
}

export interface UpdateCartItemData {
    cartItemId: string;
    quantity: number;
}

export interface ApplyCouponData {
    code: string;
}

export interface CouponResponse {
    valid: boolean;
    discount?: number;
    message?: string;
}

export interface CartResponse {
    id: number;
    items: CartItemResponse[];
    itemCount: number;
    subtotal: number;
    discount: number;
    deliveryCharges: number;
    total: number;
}

export interface CartItemResponse {
    id: number;
    productId: number;
    skuId: number;
    productName: string;
    skuCode: string;
    imageUrl?: string;
    quantity: number;
    price: number;
    originalPrice: number;
    discount: number;
    total: number;
    stock: number;
    attributes?: Record<string, string>;
}
