// Order Types

import { Address } from './user';
import { Product } from './product';

export type OrderStatus =
    | 'CREATED'
    | 'PAID'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'PAYMENT_PENDING';

export type PaymentMethod = 'cod' | 'upi' | 'card' | 'netbanking' | 'wallet';

export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'RETURNED';

export interface OrderItem {
    id: string;
    productId: string;
    product: Product;
    quantity: number;
    price: number;
    originalPrice?: number;
    discount?: number;
    total: number;
}

export interface OrderTimeline {
    status: OrderStatus;
    message: string;
    timestamp: string;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    items: OrderItem[];
    shippingAddress: Address;
    billingAddress?: Address;

    // Pricing
    subtotal: number;
    discount: number;
    deliveryCharges: number;
    tax?: number;
    total: number;

    // Coupon
    couponCode?: string;
    couponDiscount?: number;

    // Payment
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentId?: string;

    // Status
    status: OrderStatus;
    timeline: OrderTimeline[];

    // Delivery
    estimatedDelivery?: string;
    deliveredAt?: string;
    deliveryInstructions?: string;

    // Metadata
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderData {
    addressId: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    deliveryInstructions?: string;
    notes?: string;
}

export interface OrdersResponse {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface Coupon {
    id: string;
    code: string;
    description?: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    validFrom: string;
    validTo: string;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
}
export interface AdminOrderListResponse {
    id: number;
    userId: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    createdAt: string;
}

export interface AdminOrderDetailResponse {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    userPhone: string;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    totalAmount: number;
    createdAt: string;
    paymentMethod: string;
    item: {
        skuId: number;
        skuCode: string;
        price: number;
        quantity: number;
        productName: string;
        productImage: string;
        productId: number;
    }[];
    shippingAddress: Address;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
}

export interface UpdateOrderStatusRequest {
    status: OrderStatus;
}

export interface AnalyticsStats {
    totalOrders: number;
    totalRevenue: number;
    totalProfit: number;
    pendingOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
}

export interface DailyTrend {
    date: string;
    orderCount: number;
    revenue: number;
}

export interface OrderAnalyticsResponse {
    today: AnalyticsStats;
    weekly: AnalyticsStats;
    monthly: AnalyticsStats;
    allTime: AnalyticsStats;
    trends: DailyTrend[];
    statusDistribution: Record<string, number>;
}
