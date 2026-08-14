/**
 * Slot Control — Firestore helpers for delivery slot management.
 * Pure functions with zero platform-specific code.
 */
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getCountFromServer,
    runTransaction,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
    DELIVERY_SLOT_KEYS,
    BUFFER_TIME_MINUTES,
    DEFAULT_SLOT_LIMIT,
} from './config';
import type { DailySlotControl, SlotKey, SlotConfig } from './types/index';

const COLLECTION_NAME = 'dailySlotControl';
const IST_OFFSET_MINUTES = 330;

// ─── Date Helpers ─────────────────────────────────────────

/**
 * Returns today's date string as `YYYY-MM-DD` in Asia/Kolkata (IST).
 */
export function getTodayDateString(): string {
    return getDateStringIST(new Date());
}

/**
 * Returns tomorrow's date string as `YYYY-MM-DD` in Asia/Kolkata (IST).
 */
export function getTomorrowDateString(): string {
    const now = new Date();
    const istMs = now.getTime() + (now.getTimezoneOffset() + IST_OFFSET_MINUTES) * 60_000;
    const tomorrow = new Date(istMs + 86_400_000);
    return getDateStringIST(tomorrow);
}

/**
 * Formats a `YYYY-MM-DD` date string to human-friendly pill label, e.g. "Fri, 15 Aug".
 */
export function formatDatePill(dateStr: string): string {
    try {
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
    } catch {
        return dateStr;
    }
}

function getDateStringIST(date: Date): string {
    const istMs = date.getTime() + (date.getTimezoneOffset() + IST_OFFSET_MINUTES) * 60_000;
    const ist = new Date(istMs);
    const y = ist.getFullYear();
    const m = String(ist.getMonth() + 1).padStart(2, '0');
    const d = String(ist.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getCurrentTimeIST(): { hour: number; minute: number } {
    const now = new Date();
    const istMs = now.getTime() + (now.getTimezoneOffset() + IST_OFFSET_MINUTES) * 60_000;
    const ist = new Date(istMs);
    return { hour: ist.getHours(), minute: ist.getMinutes() };
}

// ─── Default Data ─────────────────────────────────────────

export function getDefaultSlotControl(): DailySlotControl {
    const slots = {} as Record<SlotKey, SlotConfig>;
    for (const s of DELIVERY_SLOT_KEYS) {
        slots[s.key as SlotKey] = { enabled: true, maxOrders: DEFAULT_SLOT_LIMIT };
    }
    return { shopClosed: false, slots };
}

// ─── Firestore CRUD ───────────────────────────────────────

export async function fetchDailySlotControl(date: string): Promise<DailySlotControl> {
    try {
        const ref = doc(db, COLLECTION_NAME, date);
        const snap = await getDoc(ref);
        if (!snap.exists()) return getDefaultSlotControl();
        const data = snap.data() as Partial<DailySlotControl>;
        const defaults = getDefaultSlotControl();
        return {
            shopClosed: data.shopClosed ?? defaults.shopClosed,
            slots: { ...defaults.slots, ...(data.slots ?? {}) },
        };
    } catch (err) {
        console.error('[slotControl] fetchDailySlotControl failed, using defaults:', err);
        return getDefaultSlotControl();
    }
}

export async function saveDailySlotControl(
    date: string,
    data: Partial<DailySlotControl>
): Promise<void> {
    const ref = doc(db, COLLECTION_NAME, date);
    await setDoc(ref, data, { merge: true });
}

// ─── Order Count Queries ──────────────────────────────────

const COUNTABLE_STATUSES = ['pending', 'confirmed', 'accepted'];

export async function getOrderCountForSlot(date: string, slotKey: string): Promise<number> {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef,
            where('deliveryDate', '==', date),
            where('deliverySlot', '==', slotKey),
            where('status', 'in', COUNTABLE_STATUSES)
        );
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (err) {
        console.warn(`[slotControl] getOrderCountForSlot(${date}, ${slotKey}) fallback to 0:`, err);
        return 0;
    }
}

export async function getOrderCountsForAllSlots(date: string): Promise<Record<string, number>> {
    const entries = await Promise.all(
        DELIVERY_SLOT_KEYS.map(async (s) => {
            const count = await getOrderCountForSlot(date, s.key);
            return [s.key, count] as [string, number];
        })
    );
    return Object.fromEntries(entries);
}

// ─── Buffer Time Logic ────────────────────────────────────

export function isSlotBlockedByBuffer(startHour: number, isToday: boolean): boolean {
    if (!isToday) return false;
    const { hour, minute } = getCurrentTimeIST();
    const currentMinutes = hour * 60 + minute;
    const cutoffMinutes = startHour * 60 - BUFFER_TIME_MINUTES;
    return currentMinutes >= cutoffMinutes;
}

// ─── Rich Delivery Slot Model ─────────────────────────────

export type SlotStatus = 'AVAILABLE' | 'ALMOST_FULL' | 'FULL' | 'PASSED' | 'DISABLED';

export interface DeliverySlot {
    key: string;
    label: string;
    startHour: number;
    orderCount: number;
    maxOrders: number;
    remainingOrders: number;
    status: SlotStatus;
    isAvailable: boolean;
}

export interface SlotAvailabilityResult {
    shopClosed: boolean;
    date: string;
    isToday: boolean;
    slots: DeliverySlot[];
    isFullyUnavailable: boolean;
}

export interface DeliverySelection {
    dateType: 'today' | 'tomorrow';
    deliveryDate: string;
    slotKey: string | null;
    slotLabel: string | null;
}

/**
 * Resolves slot availability for a specified date without mutating the target date.
 */
export async function getAvailableSlots(date: string): Promise<SlotAvailabilityResult> {
    const today = getTodayDateString();
    const isToday = date === today;

    try {
        const [control, counts] = await Promise.all([
            fetchDailySlotControl(date),
            getOrderCountsForAllSlots(date),
        ]);

        const slots: DeliverySlot[] = DELIVERY_SLOT_KEYS.map((slotDef) => {
            const key = slotDef.key as SlotKey;
            const slotConfig = control.slots[key] ?? { enabled: true, maxOrders: DEFAULT_SLOT_LIMIT };
            const orderCount = counts[key] ?? 0;
            const maxOrders = slotConfig.maxOrders ?? DEFAULT_SLOT_LIMIT;
            const remainingOrders = Math.max(0, maxOrders - orderCount);

            let status: SlotStatus = 'AVAILABLE';
            let isAvailable = true;

            if (control.shopClosed || !slotConfig.enabled) {
                status = 'DISABLED';
                isAvailable = false;
            } else if (isSlotBlockedByBuffer(slotDef.startHour, isToday)) {
                status = 'PASSED';
                isAvailable = false;
            } else if (orderCount >= maxOrders) {
                status = 'FULL';
                isAvailable = false;
            } else if (remainingOrders === 1) {
                status = 'ALMOST_FULL';
                isAvailable = true;
            }

            return {
                key: slotDef.key,
                label: slotDef.label,
                startHour: slotDef.startHour,
                orderCount,
                maxOrders,
                remainingOrders,
                status,
                isAvailable,
            };
        });

        const isFullyUnavailable = control.shopClosed || slots.every((s) => !s.isAvailable);

        return {
            shopClosed: control.shopClosed,
            date,
            isToday,
            slots,
            isFullyUnavailable,
        };
    } catch (err) {
        console.error('[slotControl] getAvailableSlots fallback to defaults:', err);
        const slots: DeliverySlot[] = DELIVERY_SLOT_KEYS.map((slotDef) => {
            const isBlocked = isSlotBlockedByBuffer(slotDef.startHour, isToday);
            return {
                key: slotDef.key,
                label: slotDef.label,
                startHour: slotDef.startHour,
                orderCount: 0,
                maxOrders: DEFAULT_SLOT_LIMIT,
                remainingOrders: DEFAULT_SLOT_LIMIT,
                status: isBlocked ? 'PASSED' : 'AVAILABLE',
                isAvailable: !isBlocked,
            };
        });

        return {
            shopClosed: false,
            date,
            isToday,
            slots,
            isFullyUnavailable: slots.every((s) => !s.isAvailable),
        };
    }
}

// ─── Atomic Order Placement with Slot Capacity Validation ─

export async function createOrderWithSlotValidation(
    orderData: Record<string, unknown>,
    slotKey: string | null,
    deliveryDate: string,
    idempotencyKey: string
): Promise<{ orderId: string; duplicate: boolean }> {
    const orderRef = doc(db, 'orders', idempotencyKey);
    const isToday = deliveryDate === getTodayDateString();

    return await runTransaction(db, async (transaction) => {
        // 1. Idempotency Check
        const existingOrder = await transaction.get(orderRef);
        if (existingOrder.exists()) {
            return { orderId: idempotencyKey, duplicate: true };
        }

        // 2. Atomic Slot Capacity Check (for Home Delivery)
        if (slotKey) {
            const slotDocRef = doc(db, COLLECTION_NAME, deliveryDate);
            const slotSnap = await transaction.get(slotDocRef);

            const slotDef = DELIVERY_SLOT_KEYS.find((s) => s.key === slotKey);
            if (slotDef && isSlotBlockedByBuffer(slotDef.startHour, isToday)) {
                throw new Error('SLOT_PASSED');
            }

            let currentCount = 0;
            let maxOrders = DEFAULT_SLOT_LIMIT;

            if (slotSnap.exists()) {
                const data = slotSnap.data() as Partial<DailySlotControl>;
                if (data.shopClosed) {
                    throw new Error('SHOP_CLOSED');
                }
                const slotConfig = data.slots?.[slotKey as SlotKey];
                if (slotConfig?.enabled === false) {
                    throw new Error('SLOT_DISABLED');
                }
                currentCount = slotConfig?.orderCount ?? 0;
                maxOrders = slotConfig?.maxOrders ?? DEFAULT_SLOT_LIMIT;
            }

            if (currentCount >= maxOrders) {
                throw new Error('SLOT_CAPACITY_EXCEEDED');
            }

            // 3. Atomically update only the targeted slot counter using dot notation
            if (slotSnap.exists()) {
                transaction.update(slotDocRef, {
                    [`slots.${slotKey}.orderCount`]: currentCount + 1,
                    updatedAt: serverTimestamp(),
                });
            } else {
                const defaults = getDefaultSlotControl();
                defaults.slots[slotKey as SlotKey].orderCount = currentCount + 1;
                transaction.set(slotDocRef, {
                    ...defaults,
                    updatedAt: serverTimestamp(),
                });
            }
        }

        // 4. Create the order with idempotent document ID
        transaction.set(orderRef, {
            ...orderData,
            id: idempotencyKey,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return { orderId: idempotencyKey, duplicate: false };
    });
}

// ─── Slot Capacity Release (Cancellation / Reversal) ──────

export async function releaseSlotCapacity(deliveryDate: string, slotKey: string): Promise<void> {
    if (!slotKey || !deliveryDate) return;
    const slotDocRef = doc(db, COLLECTION_NAME, deliveryDate);

    try {
        await runTransaction(db, async (transaction) => {
            const slotSnap = await transaction.get(slotDocRef);
            if (!slotSnap.exists()) return;
            const data = slotSnap.data() as Partial<DailySlotControl>;
            const current = data.slots?.[slotKey as SlotKey]?.orderCount ?? 0;
            if (current > 0) {
                transaction.update(slotDocRef, {
                    [`slots.${slotKey}.orderCount`]: current - 1,
                    updatedAt: serverTimestamp(),
                });
            }
        });
    } catch (err) {
        console.warn(`[slotControl] releaseSlotCapacity(${deliveryDate}, ${slotKey}) failed:`, err);
    }
}
