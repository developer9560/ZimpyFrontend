// Product Types

export interface Category {
    id: number;
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
    level: number;
    priority?: number;
    isFeatured?: boolean;
}

export type CategoryResponse = Category;

export interface CategoryMiniResponse {
    id: number;
    name: string;
    isActive: boolean;
    slug: string;
}

export interface ProductImage {
    id: number;
    imageUrl: string;
    isPrimary: boolean;
    sortOrder: number;
}

export interface ProductImageResponse extends ProductImage {
    productId: number;
}

export interface ProductSku {
    id: number;
    skuCode: string;
    price: number;
    mrp: number;
    costPrice: number;
    productId: number;
    stock: number;
}

export interface ProductSkuRequest {
    productId: number;
    price: number;
    mrp: number;
    costPrice: number;
    stock: number;
}

export interface CategoryTreeResponse {
    id: number;
    name: string;
    slug: string;
    level: number;
    imageUrl?: string;
    children: CategoryTreeResponse[];
    isActive: boolean;
    priority?: number;
    productCount: number;
    isFeatured?: boolean;
}

export interface ProductDetail {
    key: string;
    value: string;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    productDetails: ProductDetail[];
    summary: string;
    brand?: string;
    isActive: boolean;
    category: CategoryMiniResponse;
    images: ProductImage[];
    skus: ProductSku[];
    unit?: string; // Optional unit for display
    rating?: number;
    reviewCount?: number;
}

export interface ProductFilters {
    categoryId?: string;
    subcategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    brands?: string[];
    inStock?: boolean;
    discount?: number;
    rating?: number;
    sortBy?: 'popularity' | 'price_asc' | 'price_desc' | 'newest' | 'discount' | 'rating';
    search?: string;
    page?: number;
    limit?: number;
}

export interface ProductsResponse {
    content: Product[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
    isVerifiedPurchase: boolean;
    helpfulCount: number;
    createdAt: string;
}

export interface ProductAnalytics {
    totalProducts: number;
    activeProducts: number;
    inActiveProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    productsByCategory: Record<string, number>;
}

export interface ProductAttributeValue {
    name: string;
    type: string;
    value: string;
}

export interface ProductSkuDetailed {
    id: number;
    skuCode: string;
    price: number;
    mrp: number;
    stock: number;
    attributeValues: ProductAttributeValue[];
}

export interface ProductMiniResponse {
    id: number;
    slug: string;
    name: string;
    brandName: string;
    imageUrl: string;
    skus: ProductSkuDetailed[];
}

export interface CategoryProduct {
    category: CategoryMiniResponse;
    products: Product[];
}

export interface CategoryResponseForProductCard {
    category: CategoryMiniResponse;
    products: ProductMiniResponse[];
}

export interface ProductVariants {
    productId: number;
    productName: string;
    attributes: VariantAttribute[];
    skuVariants: SkuVariant[];
}

export interface VariantAttribute {
    attributeId: number;
    attributeName: string;
    attributeType: string;
    options: AttributeOption[];
}

export interface AttributeOption {
    valueId: number;
    value: string;
}

export interface SkuVariant {
    skuId: number;
    price: number;
    mrp: number;
    stock: number;
    attributeValues: Record<number, number>; // attributeId -> valueId
}
