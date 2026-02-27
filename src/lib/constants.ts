// Constants and Configuration

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Route Constants
export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',

  // User
  USER_HOME: '/user',
  PRODUCTS: '/user/products',
  PRODUCT_DETAIL: (id: string) => `/user/products/${id}`,
  CATEGORY: (slug: string) => `/user/category/${slug}`,
  CART: '/user/cart',
  CHECKOUT: '/user/checkout',
  ORDER_SUCCESS: (orderId: string) => `/user/order-success/${orderId}`,

  // Account
  ACCOUNT: '/user/account',
  MY_ORDERS: '/user/account/orders',
  ORDER_DETAIL: (id: string) => `/user/account/orders/${id}`,
  ADDRESSES: '/user/account/addresses',
  WISHLIST: '/user/account/wishlist',

  // Static
  ABOUT: '/about',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_COUPONS: '/admin/coupons',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',

  // User
  PROFILE: '/users/me',
  UPDATE_PROFILE: '/users/me',
  ADDRESSES: '/addresses',

  // Products
  PRODUCTS: '/public/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  PRODUCT_BY_SLUG: (slug: string) => `/products/slug/${slug}`,
  PRODUCT_REVIEWS: (id: string) => `/products/${id}/reviews`,

  // Categories
  CATEGORIES: '/categories',
  CATEGORY_BY_SLUG: (slug: string) => `/categories/slug/${slug}`,
  CATEGORY_PRODUCTS: (slug: string) => `/public/products?category=${slug}`,

  // Cart
  CART: '/cart',
  ADD_TO_CART: '/cart/add',
  UPDATE_CART: '/cart/update',
  REMOVE_FROM_CART: (itemId: string) => `/cart/remove/${itemId}`,
  CLEAR_CART: '/cart/clear',
  APPLY_COUPON: '/cart/apply-coupon',
  REMOVE_COUPON: '/cart/remove-coupon',

  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  CREATE_ORDER: '/orders/create',
  CANCEL_ORDER: (id: string) => `/orders/${id}/cancel`,

  // Wishlist
  WISHLIST: '/wishlist',
  ADD_TO_WISHLIST: '/wishlist/add',
  REMOVE_FROM_WISHLIST: (productId: string) => `/wishlist/remove/${productId}`,

  // Search
  SEARCH: '/public/products/search',
  SEARCH_SUGGESTIONS: '/search/suggestions',

  // Coupons
  COUPONS: '/coupons',
  VALIDATE_COUPON: '/coupons/validate',

  // Admin
  ADMIN_STATS: '/admin/stats',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  ADMIN_USERS_GET_ALL: '/admin/getAllUsers',
  ADMIN_USER_ANALYTICS: '/admin/analytics',
  ADMIN_USER_STATUS: (id: number) => `/admin/users/${id}/status`,
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_COUPONS: '/admin/coupons',

  // Admin Banners
  ADMIN_BANNERS: '/admin/banners',
  ADMIN_BANNER_BY_ID: (id: number) => `/admin/banners/${id}`,
  ADMIN_BANNER_STATUS: (id: number) => `/admin/banners/${id}/status`,
  ADMIN_BANNER_TOGGLE: (id: number) => `/admin/banners/${id}/toggle`,
  ADMIN_BANNER_IMAGE: (id: number, deviceType: string) => `/admin/banners/${id}/image/${deviceType}`,
  ADMIN_BANNER_REORDER: '/admin/banners/reorder',
  ADMIN_BANNER_BY_STATUS: (status: string) => `/admin/banners/status/${status}`,
  ADMIN_BANNER_BY_PLACEMENT: (placement: string) => `/admin/banners/placement/${placement}`,
  ADMIN_BANNER_TOP_PERFORMERS: '/admin/banners/analytics/top',
} as const;

// Categories for navigation
export const CATEGORIES = [
  { id: '1', name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🍎' },
  { id: '2', name: 'Dairy & Breakfast', slug: 'dairy-breakfast', icon: '🥛' },
  { id: '3', name: 'Snacks & Beverages', slug: 'snacks-beverages', icon: '🍪' },
  { id: '4', name: 'Staples', slug: 'staples', icon: '🌾' },
  { id: '5', name: 'Personal Care', slug: 'personal-care', icon: '🧴' },
  { id: '6', name: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠' },
  { id: '7', name: 'Bakery & Sweets', slug: 'bakery-sweets', icon: '🍞' },
  { id: '8', name: 'Meat & Seafood', slug: 'meat-seafood', icon: '🥩' },
  { id: '9', name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🍎' },
  { id: '10', name: 'Dairy & Breakfast', slug: 'dairy-breakfast', icon: '🥛' },
  { id: '11', name: 'Snacks & Beverages', slug: 'snacks-beverages', icon: '🍪' },
  { id: '12', name: 'Staples', slug: 'staples', icon: '🌾' },
  { id: '13', name: 'Personal Care', slug: 'personal-care', icon: '🧴' },
  { id: '14', name: 'Home & Kitchen', slug: 'home-kitchen', icon: '🏠' },
  { id: '13', name: 'Bakery & Sweets', slug: 'bakery-sweets', icon: '🍞' },
  { id: '14', name: 'Meat & Seafood', slug: 'meat-seafood', icon: '🥩' },
] as const;

// Sort Options
export const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'discount', label: 'Discount: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
] as const;

// Price Filter Ranges
export const PRICE_RANGES = [
  { min: 0, max: 100, label: '₹0 - ₹100' },
  { min: 100, max: 300, label: '₹100 - ₹300' },
  { min: 300, max: 500, label: '₹300 - ₹500' },
  { min: 500, max: Infinity, label: '₹500+' },
] as const;

// Discount Filter Options
export const DISCOUNT_OPTIONS = [
  { value: 50, label: '50% or more' },
  { value: 40, label: '40% or more' },
  { value: 30, label: '30% or more' },
  { value: 20, label: '20% or more' },
  { value: 10, label: '10% or more' },
] as const;

// Rating Filter Options
export const RATING_OPTIONS = [
  { value: 4, label: '4★ & above' },
  { value: 3, label: '3★ & above' },
] as const;

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'cod', name: 'Cash on Delivery', icon: '💵', description: 'Pay when you receive' },
  { id: 'upi', name: 'UPI', icon: '📱', description: 'GPay, PhonePe, Paytm' },
  { id: 'card', name: 'Credit/Debit Card', icon: '💳', description: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', name: 'Net Banking', icon: '🏦', description: 'All major banks' },
] as const;

// Order Status Labels and Colors
export const ORDER_STATUS = {
  CREATED: { label: 'Created', color: 'bg-blue-100 text-blue-700', icon: '📝' },
  PENDING: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  PAID: { label: 'Paid & Processing', color: 'bg-emerald-100 text-emerald-700', icon: '💰' },
  SHIPPED: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700', icon: '🚚' },
  DELIVERED: { label: 'Delivered', color: 'bg-teal-100 text-teal-700', icon: '✅' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' },
  PAYMENT_PENDING: { label: 'Payment Pending', color: 'bg-orange-100 text-orange-700', icon: '💳' },
} as const;

// Free Delivery Threshold
export const FREE_DELIVERY_THRESHOLD = 499;

// Delivery Charge
export const DELIVERY_CHARGE = 40;

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
