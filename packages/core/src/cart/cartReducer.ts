import type { CartItem } from '../types/index';

// ─── State & Action Types ────────────────────────────────
export interface CartState {
    items: CartItem[];
}

export type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'UPDATE_QUANTITY'; payload: { meatTypeId: string; kg?: number; pieces?: number } }
    | { type: 'REMOVE_ITEM'; payload: { meatTypeId: string } }
    | { type: 'CLEAR_CART' }
    | { type: 'HYDRATE'; payload: CartItem[] };

// ─── Helper ──────────────────────────────────────────────
export function computeItemSubtotal(item: CartItem): number {
    if (item.unit === 'piece') {
        return (item.pieces ?? 0) * (item.pricePerPiece ?? 0);
    }
    return (item.kg ?? 0) * (item.pricePerKg ?? 0);
}

export function computeCartSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + computeItemSubtotal(item), 0);
}

export function computeCartItemCount(items: CartItem[]): number {
    return items.length;
}

// ─── Pure Reducer ────────────────────────────────────────
/**
 * Pure reducer — zero side effects, no DOM, no storage.
 * Works identically on web (CartContext) and mobile (CartContext).
 */
export function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingIndex = state.items.findIndex(
                (item) => item.meatTypeId === action.payload.meatTypeId
            );
            if (existingIndex >= 0) {
                const updated = [...state.items];
                const existing = updated[existingIndex];
                updated[existingIndex] = {
                    ...existing,
                    kg: existing.unit === 'kg'
                        ? (existing.kg ?? 0) + (action.payload.kg ?? 0)
                        : existing.kg,
                    pieces: existing.unit === 'piece'
                        ? (existing.pieces ?? 0) + (action.payload.pieces ?? 0)
                        : existing.pieces,
                };
                return { items: updated };
            }
            return { items: [...state.items, action.payload] };
        }

        case 'UPDATE_QUANTITY': {
            return {
                items: state.items.map((item) => {
                    if (item.meatTypeId !== action.payload.meatTypeId) return item;
                    return item.unit === 'piece'
                        ? { ...item, pieces: action.payload.pieces }
                        : { ...item, kg: action.payload.kg };
                }),
            };
        }

        case 'REMOVE_ITEM': {
            return {
                items: state.items.filter(
                    (item) => item.meatTypeId !== action.payload.meatTypeId
                ),
            };
        }

        case 'CLEAR_CART':
            return { items: [] };

        case 'HYDRATE':
            return { items: action.payload };

        default:
            return state;
    }
}
