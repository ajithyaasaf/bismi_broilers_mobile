/**
 * @bismi/core — Public API barrel export
 *
 * Import everything from this single entry point:
 *   import { MeatType, SHOP_CONFIG, formatCurrency } from '@bismi/core';
 */

// Types
export type {
    MeatType,
    Order,
    OrderItem,
    CartItem,
    SlotKey,
    SlotConfig,
    DailySlotControl,
} from './types/index';
export { OrderStatus, DeliveryType } from './types/index';

// Config
export {
    SHOP_CONFIG,
    DELIVERY_ZONES,
    DELIVERY_RADIUS_KM,
    CHICKEN_GROUPS,
    CATEGORIES,
    STATUS_CONFIG,
    DELIVERY_SLOT_KEYS,
    BUFFER_TIME_MINUTES,
    DEFAULT_SLOT_LIMIT,
    PAYMENT_METHODS,
} from './config';
export type { PaymentMethod } from './config';

// Firebase
export { db, auth, isFirebaseConfigured } from './firebase';

// Utils
export {
    formatCurrency,
    generateIdempotencyToken,
    validateMobile,
    validateQuantity,
    formatDate,
    formatShortDate,
    buildWhatsAppUrl,
    buildWhatsAppOrderUrl,
    buildUpiDeepLink,
    computeDeliveryCharge,
    truncate,
} from './utils';

// Cart
export {
    cartReducer,
    computeItemSubtotal,
    computeCartSubtotal,
    computeCartItemCount,
} from './cart/cartReducer';
export type { CartState, CartAction } from './cart/cartReducer';

// Slot Control
export {
    getTodayDateString,
    getTomorrowDateString,
    getDefaultSlotControl,
    fetchDailySlotControl,
    saveDailySlotControl,
    getOrderCountForSlot,
    getOrderCountsForAllSlots,
    isSlotBlockedByBuffer,
    getAvailableSlots,
} from './slotControl';
export type { AvailableSlot, SlotAvailabilityResult } from './slotControl';
