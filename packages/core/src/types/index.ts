import { Timestamp } from 'firebase/firestore';

// ─── Enums ───────────────────────────────────────────────
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ACCEPTED = 'accepted',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum DeliveryType {
  PICKUP = 'pickup',
  DELIVERY = 'delivery',
}

// ─── Slot Control Types ─────────────────────────────────
export type SlotKey = '6-8' | '8-10' | '10-12' | '12-2' | '5-7' | '7-8';

export interface SlotConfig {
  enabled: boolean;
  maxOrders: number;
  orderCount?: number;
}

export interface DailySlotControl {
  shopClosed: boolean;
  slots: Record<SlotKey, SlotConfig>;
}

// ─── Firestore Document Types ────────────────────────────
export interface MeatType {
  id: string;
  name: string;
  pricePerKg: number;
  pricePerPiece?: number;
  unit: 'kg' | 'piece';
  imageURL: string;
  description: string;
  category: string;
  isActive: boolean;
  localName?: string;
  updatedAt: Timestamp;
  todayAvailable?: boolean;
  todayLabel?: string;
  isAvailableToday?: boolean;
}

export interface OrderItem {
  meatTypeId: string;
  meatName: string;
  unit: 'kg' | 'piece';
  kg?: number;
  pieces?: number;
  pricePerKg?: number;
  pricePerPiece?: number;
  cuttingPreference?: string;
  subtotal: number;
}

export interface Order {
  id: string;
  customerName: string;
  mobile: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  deliveryType: DeliveryType;
  paymentMethod?: string;
  address: string;
  deliveryZone?: string;
  deliveryZoneLabel?: string;
  status: OrderStatus;
  deliveryTimeSlot?: string;
  deliveryDate?: string;
  deliverySlot?: string;
  idempotencyToken: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Cart Types (Client-side) ────────────────────────────
export interface CartItem {
  meatTypeId: string;
  meatName: string;
  unit: 'kg' | 'piece';
  kg?: number;
  pieces?: number;
  pricePerKg?: number;
  pricePerPiece?: number;
  cuttingPreference?: string;
  imageURL: string;
}
