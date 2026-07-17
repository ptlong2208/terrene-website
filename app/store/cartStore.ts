import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productSlug: string;
  productTitle: string;
  variantId: number;
  variantTitle: string;
  price: number;
  quantity: number;
  inventoryQuantity: number | null; // null = unlimited
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  count: () => number;
  open: () => void;
  close: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (variantId: number) => void;
  updateQty: (variantId: number, qty: number) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),

      addItem: (incoming) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === incoming.variantId);
          const max = incoming.inventoryQuantity;
          if (existing && max !== null && existing.quantity >= max) return state;
          const items = existing
            ? state.items.map((i) =>
                i.variantId === incoming.variantId ? { ...i, quantity: i.quantity + 1 } : i
              )
            : [...state.items, { ...incoming, quantity: 1 }];
          return { items, isOpen: true };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) }));
      },

      updateQty: (variantId, qty) => {
        if (qty <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.variantId !== variantId) return i;
            const capped = i.inventoryQuantity !== null ? Math.min(qty, i.inventoryQuantity) : qty;
            return { ...i, quantity: capped };
          }),
        }));
      },
    }),
    {
      name: 'terrene-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
