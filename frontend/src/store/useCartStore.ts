// The cart and the customer's saved details. Kept in localStorage, so a cart survives closing the tab.
// Prices here are only for display: checkout re-quotes every item and the server prices each order.
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CakeDesign } from '@/lib/types';

export interface CartItem {
  key: string;
  name: string;
  bakeryId: string;
  bakeryName: string;
  cake: CakeDesign;
  opts: string[];
  /** Server quote total when it was added. */
  total: number;
}

export interface Profile { name: string; phone: string; addr: string }

interface CartState {
  items: CartItem[];
  profile: Profile;
  add(item: Omit<CartItem, 'key'>): void;
  remove(key: string): void;
  setProfile(patch: Partial<Profile>): void;
}

const MAX_ITEMS = 10;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      profile: { name: '', phone: '', addr: '' },
      add: (item) => set((s) => ({ items: [...s.items, { ...item, key: crypto.randomUUID() }].slice(-MAX_ITEMS) })),
      remove: (key) => set((s) => ({ items: s.items.filter((x) => x.key !== key) })),
      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
    }),
    {
      name: 'ck-cart',
      storage: createJSONStorage(() => localStorage),
      // Rehydrated in <Providers> after mount, like the cake store.
      skipHydration: true,
    },
  ),
);
