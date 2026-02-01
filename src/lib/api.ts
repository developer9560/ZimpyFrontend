// API Client Configuration

import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from './constants';
import type {
  AuthResponse,
  LoginCredentials,
  SignupData,
  User,
  UpdateProfileData,
  Address,
  Product,
  ProductsResponse,
  ProductFilters,
  Category,
  Cart,
  AddToCartData,
  Order,
  OrderStatus,
  OrdersResponse,
  CreateOrderData,
  AdminOrderListResponse,
  AdminOrderDetailResponse,
  UpdateOrderStatusRequest,
  Review,
  ApiResponse,
  Coupon,
  AdminAuthResponse,
  PaginatedResponse,
  AdminUserAnalyticsResponse,
  UserDetailResponse,
  UserProfileResponse,
  CategoryTreeResponse,
  CategoryMiniResponse,
  CategoryResponse,
  ProductSku,
  ProductSkuRequest,
  Attribute,
  AttributeValue,
  AttributeRequest,
  AttributeValueRequest,
  AssignAttributeToSkuRequest,
  ProductImageResponse,
  ProductAnalytics,
  CategoryProduct,
  CartResponse,
  CategoryResponseForProductCard
} from '@/src/types';
import { userCategory, userCategoryResponse } from '@/src/types/category';
import { CheckoutResponse } from '../types/checkout';

const baseUrl = "https://api.zimpy.in"
// const baseUrl = "http://localhost:8080"

// Create axios instance
const api = axios.create({
  baseURL: baseUrl,
  headers: {

    'Content-Type': 'application/json',

  },
  withCredentials: true,
  timeout: 10000,
  maxRedirects: 0
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {


    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Detect FormData and handle headers correctly
    const isFormData = typeof window !== 'undefined' && config.data instanceof FormData;
    if (config.headers) {
      if (isFormData) {
        // Let the browser set the multipart boundary; remove any preset content-type
        if (config.headers['Content-Type']) {
          delete config.headers['Content-Type'];
        }
      } else {
        // JSON requests get explicit content-type
        config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
      }
      config.headers['Accept'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, attempt refresh or logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        localStorage.removeItem('adminUser');

        // Redirect to appropriate login page based on current path
        if (window.location.pathname.startsWith('/suraj-yuvraj-zimpy-admin')) {
          if (window.location.pathname !== '/suraj-yuvraj-zimpy-admin/adminlogin') {
            window.location.href = '/suraj-yuvraj-zimpy-admin/adminlogin';
          }
        } else {
          if (window.location.pathname !== '/auth/login') {
            window.location.href = '/auth/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);


export const versionAPI = {
  version: async (): Promise<string> => {
    const { data } = await api.get<string>("/version");
    return data;
  },
};

// Auth API
export const authAPI = {
  // Common login for both user and admin (returns token)
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AdminAuthResponse>> => {
    const { data } = await api.post<ApiResponse<AdminAuthResponse>>(API_ENDPOINTS.LOGIN, credentials);
    return data;
  },

  // User-specific signup
  signup: async (userData: SignupData): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(API_ENDPOINTS.SIGNUP, userData);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post(API_ENDPOINTS.LOGOUT);
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const { data } = await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
    return data;
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse<null>> => {
    const { data } = await api.post(API_ENDPOINTS.RESET_PASSWORD, { token, password });
    return data;
  },

  sendOTP: async (phone: string): Promise<ApiResponse<null>> => {
    const { data } = await api.post(API_ENDPOINTS.SEND_OTP, { phone });
    return data;
  },

  verifyOTP: async (phone: string, otp: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>(API_ENDPOINTS.VERIFY_OTP, { phone, otp });
    return data;
  },

  // Password Reset Flow
  requestPasswordReset: async (email: string): Promise<ApiResponse<void>> => {
    const { data } = await api.post('/auth/password/reset/request', { email });
    return data;
  },

  verifyPasswordResetOTP: async (email: string, otp: string): Promise<ApiResponse<void>> => {
    const { data } = await api.post('/auth/password/reset/verify', { email, otp });
    return data;
  },

  confirmPasswordReset: async (email: string, otp: string, newPassword: string): Promise<ApiResponse<void>> => {
    const { data } = await api.post('/auth/password/reset/confirm', { email, otp, newPassword });
    return data;
  },

  resendPasswordResetOTP: async (email: string): Promise<ApiResponse<void>> => {
    const { data } = await api.post('/auth/password/reset/resend', { email });
    return data;
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const { data } = await api.get('/users/me');
    return data;
  },

  updateProfile: async (profileData: UpdateProfileData): Promise<User> => {
    const { data } = await api.patch<User>(API_ENDPOINTS.UPDATE_PROFILE, profileData);
    return data;
  },

  getAddresses: async (): Promise<Address[]> => {
    const { data } = await api.get<ApiResponse<any[]>>('/user/address');
    // Map backend response to Frontend Address type
    const backendAddresses = data.data || [];
    return backendAddresses.map((addr) => ({
      id: String(addr.id),
      userId: '',

      phone: addr.contactNumber,
      contactNumber: addr.contactNumber,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      pincode: addr.postalCode,
      country: addr.country,
      type: addr.type === 'WORK' ? 'office' : 'home',
      isDefault: addr.default || addr.isDefault,
      createdAt: '',
      updatedAt: ''
    }));
  },

  addAddress: async (address: Omit<Address, 'id' | 'userId'>): Promise<Address> => {
    const payload = {
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      country: address.country || 'India',
      postalCode: address.postalCode,
      contactNumber: address.contactNumber,
      type: address.type === 'office' ? 'WORK' : 'HOME',
      isDefault: address.isDefault
    };

    const { data } = await api.post<ApiResponse<any>>('/user/address/add', payload);
    const responseData = data.data;

    return {
      id: String(responseData.id),
      userId: '',
      contactNumber: responseData.contactNumber,
      addressLine1: responseData.addressLine1,
      addressLine2: responseData.addressLine2,
      city: responseData.city,
      state: responseData.state,
      postalCode: responseData.postalCode,
      country: responseData.country,
      type: responseData.type === 'WORK' ? 'office' : 'home',
      isDefault: responseData.default || responseData.isDefault,
    };
  },

  updateAddress: async (id: string, address: Partial<Address>): Promise<Address> => {
    const payload = {
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      country: address.country || 'India',
      postalCode: address.postalCode,
      contactNumber: address.contactNumber,
      type: address.type === 'office' ? 'WORK' : 'HOME',
      isDefault: address.isDefault
    };

    const { data } = await api.put<ApiResponse<any>>(`/user/address/update/${id}`, payload);
    const responseData = data.data;

    return {
      id: String(responseData.id),
      userId: '',
      contactNumber: responseData.contactNumber,
      addressLine1: responseData.addressLine1,
      addressLine2: responseData.addressLine2,
      city: responseData.city,
      state: responseData.state,
      postalCode: responseData.postalCode,
      country: responseData.country,
      type: responseData.type === 'WORK' ? 'office' : 'home',
      isDefault: responseData.default || responseData.isDefault,
    };
  },

  deleteAddress: async (id: string): Promise<void> => {
    await api.delete(`/user/address/delete/${id}`);
  },
};

// Address API
export const addressAPI = {
  add: async (data: any) => {
    const res = await api.post<ApiResponse<any>>('/user/address/add', data);
    return res.data.data;
  },
  getAll: async () => {
    const res = await api.get<ApiResponse<any[]>>('/user/address');
    return res.data.data;
  },
  update: async (id: number, data: any) => {
    const res = await api.put<ApiResponse<any>>(`/user/address/update/${id}`, data);
    return res.data.data;
  },
  delete: async (id: number) => {
    const res = await api.delete<ApiResponse<string>>(`/user/address/delete/${id}`);
    return res.data.data;
  }
};

// Order API
export const orderAPI = {
  checkout: async (data: { addressId: number; paymentMethod: string }) => {
    // Return full response object (success, status, data) as expected by CheckoutPage
    const res = await api.post<CheckoutResponse>('/orders/checkout', data);
    return res.data;
  },
  getMyOrders: async (page = 0, size = 10) => {
    const res = await api.get<ApiResponse<any>>(`/orders?page=${page}&size=${size}`);
    return res.data.data;
  },
  getOrder: async (id: number) => {
    const res = await api.get<ApiResponse<any>>(`/orders/${id}`);
    return res.data.data;
  },
  cancel: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/orders/${id}/cancel`);
    return response.data;
  }
};

export const adminOrdersAPI = {
  getAll: async (params?: {
    status?: OrderStatus,
    userId?: number,
    page?: number,
    size?: number
  }): Promise<ApiResponse<{ content: AdminOrderListResponse[], totalElements: number }>> => {
    const response = await api.get<ApiResponse<{ content: AdminOrderListResponse[], totalElements: number }>>('/admin/orders', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<AdminOrderDetailResponse>> => {
    const response = await api.get<ApiResponse<AdminOrderDetailResponse>>(`/admin/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<ApiResponse<void>> => {
    const response = await api.patch<ApiResponse<void>>(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  updatePaymentStatus: async (id: string, paymentStatus: string): Promise<ApiResponse<void>> => {
    const response = await api.patch<ApiResponse<void>>(`/admin/orders/${id}/payment-status`, { paymentStatus });
    return response.data;
  },

  cancel: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(`/admin/orders/${id}/cancel`);
    return response.data;
  },
  getAnalytics: async (): Promise<ApiResponse<import('@/src/types').OrderAnalyticsResponse>> => {
    const response = await api.get<ApiResponse<import('@/src/types').OrderAnalyticsResponse>>('/admin/orders/analytics');
    return response.data;
  }
};

export const paymentAPI = {
  verify: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/api/payments/verify', data);
    return response.data;
  }
};

// Products API
export const productsAPI = {
  create: async (productData: any): Promise<Product> => {
    const { data } = await api.post<ApiResponse<Product>>('/admin/products', productData);
    return data.data;
  },
  update: async (id: number | string, productData: any): Promise<Product> => {
    const { data } = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, productData);
    return data.data;
  },
  getAll: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    const { data } = await api.get<ProductsResponse>(API_ENDPOINTS.PRODUCTS, {
      params: filters,
    });
    return data;
  },

  softDelete: async (id: number | string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },

  permanentDelete: async (id: number | string): Promise<void> => {
    await api.delete(`/admin/products/${id}/permanent`);
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(API_ENDPOINTS.PRODUCT_BY_ID(id));
    return data;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const { data } = await api.get<Product>(API_ENDPOINTS.PRODUCT_BY_SLUG(slug));
    return data;
  },

  getAnalytics: async (): Promise<ApiResponse<ProductAnalytics>> => {
    const { data } = await api.get<ApiResponse<ProductAnalytics>>('/admin/products/analytics');
    return data;
  },

  getByCategory: async (categorySlug: string, filters?: ProductFilters): Promise<ProductsResponse> => {
    const { data } = await api.get<ProductsResponse>(API_ENDPOINTS.CATEGORY_PRODUCTS(categorySlug), {
      params: filters,
    });
    return data;
  },

  search: async (query: string, filters?: ProductFilters): Promise<ProductsResponse> => {
    const { data } = await api.get<ProductsResponse>(API_ENDPOINTS.SEARCH, {
      params: { q: query, ...filters },
    });
    return data;
  },

  getReviews: async (productId: string): Promise<Review[]> => {
    const { data } = await api.get<Review[]>(API_ENDPOINTS.PRODUCT_REVIEWS(productId));
    return data;
  },

  addReview: async (productId: string, review: Omit<Review, 'id' | 'userId' | 'userName' | 'createdAt'>): Promise<Review> => {
    const { data } = await api.post<Review>(API_ENDPOINTS.PRODUCT_REVIEWS(productId), review);
    return data;
  },

  getProductsByCategory: async (): Promise<CategoryResponseForProductCard[]> => {
    const response = await api.get('/public/products/grouped-by-category');
    // Backend returns data directly, not wrapped in ApiResponse
    return Array.isArray(response.data) ? response.data : [];
  },

  getProductVariants: async (productId: number) => {
    const { data } = await api.get(`/public/products/${productId}/variants`);
    return data;
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get<Category[]>(API_ENDPOINTS.CATEGORIES);
    return data;
  },

  getBySlug: async (slug: string): Promise<Category> => {
    const { data } = await api.get<Category>(API_ENDPOINTS.CATEGORY_BY_SLUG(slug));
    return data;
  },
};

// Cart API
export const cartAPI = {
  get: async (): Promise<CartResponse> => {
    const { data } = await api.get<CartResponse>('/cart');
    return data;
  },

  addItem: async (item: AddToCartData): Promise<CartResponse> => {
    const { data } = await api.post<CartResponse>('/cart/add', item);
    return data;
  },

  updateItem: async (skuId: number, quantity: number): Promise<CartResponse> => {
    const { data } = await api.put<CartResponse>(`/cart/update`, null, {
      params: { skuId, quantity }
    });
    return data;
  },

  removeItem: async (skuId: number): Promise<CartResponse> => {
    const { data } = await api.delete<CartResponse>(`/cart/remove/${skuId}`);
    return data;
  },

  clear: async (): Promise<ApiResponse<void>> => {
    const { data } = await api.delete<ApiResponse<void>>('/cart/clear');
    return data;
  },

  // Coupon methods remain same for now, or update if backend changes
  applyCoupon: async (code: string): Promise<CartResponse> => {
    // Placeholder if backend endpoint exists, otherwise keep local or implement later
    const { data } = await api.post<CartResponse>(API_ENDPOINTS.APPLY_COUPON, { code });
    return data;
  },

  removeCoupon: async (): Promise<CartResponse> => {
    const { data } = await api.delete<CartResponse>(API_ENDPOINTS.REMOVE_COUPON);
    return data;
  },
};

// Orders API
export const ordersAPI = {
  getAll: async (page?: number, limit?: number): Promise<OrdersResponse> => {
    const { data } = await api.get<ApiResponse<any>>(API_ENDPOINTS.ORDERS, {
      params: { page, size: limit }, // Use size instead of limit generally for Spring Pageable, but UserOrderController takes size now
    });
    // Map Spring Page response to OrdersResponse
    const pageData = data.data;
    const content = pageData.content || [];

    // Map Backend DTO to Frontend Order Type
    const mappedOrders: any[] = content.map((item: any) => ({
      id: String(item.orderId),
      orderNumber: item.orderNumber,
      status: item.status,
      total: item.totalAmount,
      createdAt: item.createdAt,
      items: (item.items || []).map((i: any) => ({
        id: String(i.skuId), // Use partial ID
        quantity: i.quantity,
        price: i.price,
        total: i.price * i.quantity,
        product: {
          name: i.productName,
          images: i.productImage ? [{ url: i.productImage }] : []
        }
      })),
      // Mock required fields that are not in the list view DTO
      shippingAddress: {},
      paymentMethod: 'cod',
      subtotal: item.totalAmount,
      discount: 0,
      deliveryCharges: 0,
      paymentStatus: 'PENDING',
      timeline: []
    }));

    return {
      orders: mappedOrders,
      total: pageData.totalElements || 0,
      page: (pageData.number || 0) + 1, // Convert back to 1-based
      limit: pageData.size || 10,
      totalPages: pageData.totalPages || 0
    };
  },

  getById: async (id: string): Promise<Order> => {
    const { data } = await api.get<ApiResponse<any>>(`orders/${id}`);
    const orderData = data.data;

    // Map Backend OrderDetailResponse to Frontend Order Type
    return {
      id: String(orderData.orderId),
      orderNumber: String(orderData.orderId), // Fallback if number missing
      status: orderData.status,
      total: orderData.totalAmount,
      createdAt: orderData.createdAt,
      items: (orderData.items || []).map((i: any) => ({
        id: String(i.skuId),
        quantity: i.quantity,
        price: i.price,
        total: i.price * i.quantity,
        productId: String(i.productId),
        product: {
          id: Number(i.productId),
          name: i.productName,
          slug: '', // Placeholder
          description: '',
          summary: '',
          isActive: true,
          category: { id: 0, name: '', isActive: true },
          images: i.productImage ? [{ id: 0, imageUrl: i.productImage, isPrimary: true, sortOrder: 0, productId: Number(i.productId) }] : [],
          skus: []
        }
      })),
      shippingAddress: orderData.addressResponse ? {
        id: String(orderData.addressResponse.id),
        userId: '',
        contactNumber: orderData.addressResponse.contactNumber,
        addressLine1: orderData.addressResponse.addressLine1,
        addressLine2: orderData.addressResponse.addressLine2,
        city: orderData.addressResponse.city,
        state: orderData.addressResponse.state,
        postalCode: orderData.addressResponse.postalCode,
        country: orderData.addressResponse.country,
        type: orderData.addressResponse.type === 'HOME' ? 'home' : 'office',
        isDefault: orderData.addressResponse.default
      } : {} as any,
      paymentMethod: 'cod', // Default or fetch if available
      subtotal: orderData.totalAmount,
      discount: 0,
      deliveryCharges: 0,
      paymentStatus: 'PENDING',
      timeline: [],
      userId: '', // Placeholder
      updatedAt: orderData.createdAt // Placeholder
    };
  },

  create: async (orderData: CreateOrderData): Promise<Order> => {
    const { data } = await api.post<Order>(API_ENDPOINTS.CREATE_ORDER, orderData);
    return data;
  },

  cancel: async (id: string, reason?: string): Promise<Order> => {
    const { data } = await api.post<Order>(API_ENDPOINTS.CANCEL_ORDER(id), { reason });
    return data;
  },
};

// Wishlist API
export const wishlistAPI = {
  get: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>(API_ENDPOINTS.WISHLIST);
    return data;
  },

  add: async (productId: string): Promise<void> => {
    await api.post(API_ENDPOINTS.ADD_TO_WISHLIST, { productId });
  },

  remove: async (productId: string): Promise<void> => {
    await api.delete(API_ENDPOINTS.REMOVE_FROM_WISHLIST(productId));
  },
};

// Coupons API
export const couponsAPI = {
  getAll: async (): Promise<Coupon[]> => {
    const { data } = await api.get<Coupon[]>(API_ENDPOINTS.COUPONS);
    return data;
  },

  validate: async (code: string, cartTotal: number): Promise<{ valid: boolean; discount?: number; message?: string }> => {
    const { data } = await api.post(API_ENDPOINTS.VALIDATE_COUPON, { code, cartTotal });
    return data;
  },
};

// Category API
export const categoryAPI = {
  getTree: async (): Promise<CategoryTreeResponse[]> => {
    const { data } = await api.get<CategoryTreeResponse[]>('/categories/tree');
    return data;
  },

  getCategories: async (): Promise<userCategory[]> => {
    const { data } = await api.get<userCategoryResponse>('/categories/all');
    return data.data;
  },

  getAllCategories: async (): Promise<CategoryMiniResponse[]> => {
    const { data } = await api.get<ApiResponse<CategoryMiniResponse[]>>('/admin/categories/all');
    return data.data;
  },


  // Admin ops
  create: async (formData: FormData): Promise<ApiResponse<CategoryResponse>> => {
    const { data } = await api.post<ApiResponse<CategoryResponse>>('/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  update: async (id: string, formData: FormData): Promise<CategoryResponse> => {
    const { data } = await api.put<CategoryResponse>(`/admin/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/categories/${id}`);
  },
  toggleActive: async (id: string | number): Promise<CategoryResponse> => {
    const { data } = await api.patch<CategoryResponse>(`/admin/categories/${id}/toggle-active`);
    return data;
  },
  toggleFeatured: async (id: string | number): Promise<CategoryResponse> => {
    const { data } = await api.patch<CategoryResponse>(`/admin/categories/${id}/toggle-featured`);
    return data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (page = 0, size = 10, status?: string, role?: string): Promise<ApiResponse<PaginatedResponse<UserDetailResponse>>> => {
    const params: any = { page, size };
    if (status) params.status = status;
    if (role) params.role = role;
    const { data } = await api.get<ApiResponse<PaginatedResponse<UserDetailResponse>>>(API_ENDPOINTS.ADMIN_USERS, { params });
    return data;
  },

  getAnalytics: async (): Promise<ApiResponse<AdminUserAnalyticsResponse>> => {
    const { data } = await api.get<ApiResponse<AdminUserAnalyticsResponse>>(API_ENDPOINTS.ADMIN_USER_ANALYTICS);
    return data;
  },

  updateUserStatus: async (userId: number, status: string): Promise<ApiResponse<void>> => {
    const { data } = await api.patch<ApiResponse<void>>(API_ENDPOINTS.ADMIN_USER_STATUS(userId), { status });
    return data;
  },

  // Banner Management
  getBanners: async (page = 0, size = 20): Promise<ApiResponse<any>> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_BANNERS, { params: { page, size } });
    return data;
  },

  getBannerById: async (id: number): Promise<ApiResponse<any>> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_BANNER_BY_ID(id));
    return data;
  },

  createBanner: async (formData: FormData): Promise<ApiResponse<any>> => {
    const { data } = await api.post(API_ENDPOINTS.ADMIN_BANNERS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  updateBanner: async (id: number, bannerData: any): Promise<ApiResponse<any>> => {
    const { data } = await api.put(API_ENDPOINTS.ADMIN_BANNER_BY_ID(id), bannerData);
    return data;
  },

  updateBannerImage: async (id: number, deviceType: string, imageFile: File): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const { data } = await api.patch(API_ENDPOINTS.ADMIN_BANNER_IMAGE(id, deviceType), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  updateBannerStatus: async (id: number, status: string): Promise<ApiResponse<any>> => {
    const { data } = await api.patch(API_ENDPOINTS.ADMIN_BANNER_STATUS(id), null, { params: { status } });
    return data;
  },

  toggleBannerStatus: async (id: number): Promise<ApiResponse<any>> => {
    const { data } = await api.patch(API_ENDPOINTS.ADMIN_BANNER_TOGGLE(id));
    return data;
  },

  deleteBanner: async (id: number): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(API_ENDPOINTS.ADMIN_BANNER_BY_ID(id));
    return data;
  },

  reorderBanners: async (bannerIds: number[]): Promise<ApiResponse<void>> => {
    const { data } = await api.post(API_ENDPOINTS.ADMIN_BANNER_REORDER, bannerIds);
    return data;
  },

  getTopPerformingBanners: async (limit = 10): Promise<ApiResponse<any[]>> => {
    const { data } = await api.get(API_ENDPOINTS.ADMIN_BANNER_TOP_PERFORMERS, { params: { limit } });
    return data;
  },
};

// SKU API
export const skuAPI = {
  create: async (sku: ProductSkuRequest): Promise<ProductSku> => {
    // AdminSkuController.addSku returns ProductSkuResponse directly
    const { data } = await api.post<ProductSku>('/admin/skus/add', sku);
    return data;
  },
  update: async (id: number, sku: Partial<ProductSkuRequest>): Promise<ProductSku> => {
    const { data } = await api.put<ProductSku>(`/admin/skus/${id}`, sku);
    return data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/skus/${id}`);
  },
  getByProduct: async (productId: number): Promise<ProductSku[]> => {
    // UserSkuController returns ApiResponse<List<ProductSkuResponse>>
    const { data } = await api.get<ApiResponse<ProductSku[]>>(`/public/sku/${productId}/get`);
    return data.data;
  }
};

// Attributes API
export const attributeAPI = {
  getAll: async (): Promise<Attribute[]> => {
    const { data } = await api.get<ApiResponse<Attribute[]>>('/admin/attributes');
    return data.data;
  },
  create: async (attr: AttributeRequest): Promise<Attribute> => {
    const { data } = await api.post<ApiResponse<Attribute>>('/admin/attributes', attr);
    return data.data;
  },
  update: async (id: number, attr: AttributeRequest): Promise<Attribute> => {
    const { data } = await api.put<ApiResponse<Attribute>>(`/admin/attributes/${id}`, attr);
    return data.data;
  },
  getValues: async (attributeId: number): Promise<AttributeValue[]> => {
    const { data } = await api.get<ApiResponse<any[]>>(`/admin/attributeValue/${attributeId}`);
    return (data.data || []).map((v: any) => ({
      ...v,
      id: v.id || v.valueId // Normalize backend valueId to id
    }));
  },
  createValue: async (val: AttributeValueRequest): Promise<AttributeValue> => {
    const { data } = await api.post<ApiResponse<AttributeValue>>('/admin/attributeValue', val);
    return data.data;
  },
  updateValue: async (id: number, val: Partial<AttributeValueRequest>): Promise<AttributeValue> => {
    const { data } = await api.put<ApiResponse<AttributeValue>>(`/admin/attributeValue/${id}`, val);
    return data.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/attributes/${id}`);
  },
  deleteValue: async (id: number): Promise<void> => {
    await api.delete(`/admin/attributeValue/${id}`);
  }
};

// SKU-Attribute Mapping API
export const skuAttributeAPI = {
  assign: async (mapping: AssignAttributeToSkuRequest): Promise<void> => {
    await api.post('/admin/attributes/assign', mapping);
  },
  unassign: async (skuId: number, valueId: number): Promise<void> => {
    await api.delete('/admin/attributes/unassign', {
      params: { skuId, valueId }
    });
  },
  getMappings: async (skuId: number): Promise<any[]> => {
    const { data } = await api.get<ApiResponse<any[]>>(`/admin/attributes/mappings/${skuId}`);
    return data.data;
  }
};

// Product Image API
export const productImageAPI = {
  upload: async (productId: number, file: File, primary = false, onProgress?: (percent: number) => void): Promise<ApiResponse<ProductImageResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('primary', String(primary));

    const { data } = await api.post<ApiResponse<ProductImageResponse>>(`/admin/images/upload/${productId}`, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    return data;
  },
  setPrimary: async (imageId: number): Promise<void> => {
    await api.patch(`/admin/images/${imageId}/primary`);
  },
  delete: async (imageId: number): Promise<void> => {
    await api.delete(`/admin/images/${imageId}`);
  }
};

export const publicApi = {
  getBanners: async (): Promise<ApiResponse<any>> => {
    const { data } = await api.get("/public/banners");
    return data;
  },
};

// Export the axios instance for custom requests
export default api;
