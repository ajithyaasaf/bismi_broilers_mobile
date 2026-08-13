import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    cartReducer,
    computeItemSubtotal,
    computeCartSubtotal,
    computeCartItemCount,
    CartState,
    CartAction,
} from '@bismi/core';
import type { CartItem } from '@bismi/core';

// ─── Context Value Interface ──────────────────────────────
export interface CartContextValue {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    isHydrated: boolean;
    toastItem: { name: string } | null;
    addItem: (item: CartItem) => void;
    updateQuantity: (meatTypeId: string, qty: number) => void;
    removeItem: (meatTypeId: string) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// ─── Storage Key ─────────────────────────────────────────
const CART_STORAGE_KEY = '@bismi/cart';

async function saveCart(items: CartItem[]): Promise<void> {
    try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch { /* silent */ }
}

async function loadCart(): Promise<CartItem[]> {
    try {
        const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (raw) return JSON.parse(raw) as CartItem[];
    } catch { /* silent */ }
    return [];
}

// ─── Provider ────────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });
    const [isHydrated, setIsHydrated] = useState(false);
    const [toastItem, setToastItem] = useState<{ name: string } | null>(null);

    // Hydrate from AsyncStorage on mount
    useEffect(() => {
        loadCart().then((saved) => {
            if (saved.length > 0) {
                dispatch({ type: 'HYDRATE', payload: saved });
            }
            setIsHydrated(true);
        });
    }, []);

    // Persist on every cart change
    useEffect(() => {
        if (isHydrated) {
            saveCart(state.items);
        }
    }, [state.items, isHydrated]);

    const showToast = useCallback((name: string) => {
        setToastItem({ name });
        const timer = setTimeout(() => setToastItem(null), 3000);
        return () => clearTimeout(timer);
    }, []);

    const addItem = useCallback((item: CartItem) => {
        dispatch({ type: 'ADD_ITEM', payload: item });
        showToast(item.meatName);
    }, [showToast]);

    const updateQuantity = useCallback((meatTypeId: string, qty: number) => {
        const item = state.items.find((i) => i.meatTypeId === meatTypeId);
        if (!item) return;
        dispatch({
            type: 'UPDATE_QUANTITY',
            payload: item.unit === 'piece'
                ? { meatTypeId, pieces: qty }
                : { meatTypeId, kg: qty },
        });
    }, [state.items]);

    const removeItem = useCallback((meatTypeId: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: { meatTypeId } });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const value: CartContextValue = {
        items: state.items,
        itemCount: computeCartItemCount(state.items),
        subtotal: computeCartSubtotal(state.items),
        isHydrated,
        toastItem,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────
export function useCart(): CartContextValue {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within <CartProvider>');
    return context;
}
