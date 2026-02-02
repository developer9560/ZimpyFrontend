// Cart Store - Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '@/src/types';
import { CartResponse } from '@/src/types/cart';
import { cartAPI } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/authStore';
import { FREE_DELIVERY_THRESHOLD, DELIVERY_CHARGE } from '@/src/lib/constants';

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryCharges: number;
  total: number;
  appliedCoupon: { code: string; discount: number } | null;
  isLoading: boolean;
}

interface CartActions {
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  getItemQuantity: (productId: number) => number;
  isInCart: (productId: number) => boolean;
}

type CartStore = CartState & CartActions;

const calculateTotals = (items: CartItem[], couponDiscount: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const itemDiscount = items.reduce((sum, item) => {
    const originalTotal = (item.originalPrice || item.price) * item.quantity;
    return sum + (originalTotal - item.total);
  }, 0);
  const totalDiscount = itemDiscount + couponDiscount;
  const deliveryCharges = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subtotal - couponDiscount + deliveryCharges;

  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    discount: totalDiscount,
    deliveryCharges,
    total: Math.max(0, total),
  };
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial State
      items: [],
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      deliveryCharges: 0,
      total: 0,
      appliedCoupon: null,
      isLoading: false,



      // ... inside useCartStore ...

      addItem: async (product: Product, quantity: number = 1) => {
        set({ isLoading: true });
        try {
          const sku = product.skus?.[0];
          if (!sku) return;

          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

          if (!token) {
            set({ isLoading: false });
            // Trigger Login Modal
            useAuthStore.getState().openLogin();
            return;
          }

          const response = await cartAPI.addItem({
            productId: product.id,
            skuId: sku.id,
            quantity
          });

          const newItems = mapBackendCartToFrontend(response);

          set({
            items: newItems,
            itemCount: response.itemCount,
            subtotal: response.subtotal,
            discount: response.discount,
            deliveryCharges: response.deliveryCharges,
            total: response.total,
            isLoading: false
          });
        } catch (error) {
          console.error(error);
          set({ isLoading: false });
        }
      },

      removeItem: async (productId: number) => {
        set({ isLoading: true });
        // We need SKU ID. For listing based removal, we assume finding item in local state to get SKU ID
        // Or we pass ProductID and find mapping.
        // Store stores CartItem which has Product info.
        const { items } = get();
        const item = items.find(i => i.productId === productId);
        // If we don't have SKU ID in CartItem type clearly, we assume product.skus[0]
        // Ideally CartItem type should have skuId. Backend DTO has it. Frontend type should have it.
        // Typescript interface for CartItem has `id` which is string, checking logic...
        // Let's assume guest mode logic remains, auth mode calls API

        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          if (token && item) {
            // We need SKU ID. item.product.skus[0].id? 
            // Let's assume simple case
            const skuId = item.product.skus?.[0]?.id;
            if (skuId) {
              const response = await cartAPI.removeItem(skuId);
              const newItems = mapBackendCartToFrontend(response);
              set({
                items: newItems,
                itemCount: response.itemCount,
                subtotal: response.subtotal,
                discount: response.discount,
                deliveryCharges: response.deliveryCharges,
                total: response.total,
                isLoading: false
              });
            }
          } else {
            // Local
            const newItems = items.filter((item) => item.productId !== productId);
            const totals = calculateTotals(newItems, 0);
            set({ items: newItems, ...totals, isLoading: false });
          }
        } catch (e) { console.error(e); set({ isLoading: false }) }
      },

      updateQuantity: async (productId: number, quantity: number) => {
        set({ isLoading: true });
        const { items } = get();
        const item = items.find(i => i.productId === productId);

        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          if (token && item) {
            const skuId = item.product.skus?.[0]?.id;
            if (skuId) {
              const response = await cartAPI.updateItem(skuId, quantity);
              const newItems = mapBackendCartToFrontend(response);
              set({
                items: newItems,
                itemCount: response.itemCount,
                subtotal: response.subtotal,
                discount: response.discount,
                deliveryCharges: response.deliveryCharges,
                total: response.total,
                isLoading: false
              });
            }
          } else {
            // Local
            const newItems = items.map((item) =>
              item.productId === productId
                ? {
                  ...item,
                  quantity,
                  total: quantity * item.price,
                }
                : item
            );

            const totals = calculateTotals(newItems, 0);
            set({ items: newItems, ...totals, isLoading: false });
          }
        } catch (e) { console.error(e); set({ isLoading: false }) }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
          if (token) {
            await cartAPI.clear();
          }
          set({
            items: [],
            itemCount: 0,
            subtotal: 0,
            discount: 0,
            deliveryCharges: 0,
            total: 0,
            appliedCoupon: null,
            isLoading: false
          });
        } catch (e) { console.error(e); set({ isLoading: false }); }
      },

      applyCoupon: (code: string, discount: number) => {
        const { items } = get();
        const totals = calculateTotals(items, discount);
        set({
          appliedCoupon: { code, discount },
          ...totals,
        });
      },

      removeCoupon: () => {
        const { items } = get();
        const totals = calculateTotals(items, 0);
        set({
          appliedCoupon: null,
          ...totals,
        });
      },

      getItemQuantity: (productId: number) => {
        const { items } = get();
        const item = items.find((item) => item.productId === productId);
        return item?.quantity || 0;
      },

      isInCart: (productId: number) => {
        const { items } = get();
        return items.some((item) => item.productId === productId);
      },

      // New action to sync initial state
      fetchCart: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await cartAPI.get();
          const newItems = mapBackendCartToFrontend(response);
          set({
            items: newItems,
            itemCount: response.itemCount,
            subtotal: response.subtotal,
            discount: response.discount,
            deliveryCharges: response.deliveryCharges,
            total: response.total,
            isLoading: false
          });
        } catch (e) {
          console.error(e);
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'zimpy-cart',
      partialize: (state) => ({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const totals = calculateTotals(state.items, state.appliedCoupon?.discount || 0);
          Object.assign(state, totals);
          // Trigger fetch on load
          if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
            // We can't easily call actions here, relying on component mount to fetch
          }
        }
      },
    }
  )
);

// Helper to map backend response to frontend structure
const mapBackendCartToFrontend = (res: CartResponse): CartItem[] => {
  return res.items.map(item => ({
    id: String(item.id),
    productId: item.productId,
    // We need to reconstruct minimal Product object
    product: {
      id: item.productId,
      name: item.productName,
      slug: '',
      productDetails: [],
      summary: '',
      isActive: true,
      category: { id: 0, name: '', isActive: true, slug: '' },
      images: item.imageUrl ? [{ id: 0, imageUrl: item.imageUrl, isPrimary: true, sortOrder: 0 }] : [],
      skus: [{
        id: item.skuId,
        skuCode: item.skuCode,
        price: item.price,
        mrp: item.originalPrice,
        costPrice: 0,
        productId: item.productId,
        stock: item.stock
      }]
    },
    quantity: item.quantity,
    price: item.price,
    originalPrice: item.originalPrice,
    discount: item.discount,
    total: item.total,
    attributes: item.attributes
  }));
};
