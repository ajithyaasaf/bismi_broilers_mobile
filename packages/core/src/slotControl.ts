/**
 * Slot Control — Firestore helpers for delivery slot management.
 * Identical logic to web — pure functions, no platform-specific code.
 */
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getCountFromServer,
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

export function getTodayDateString(): string {
    return getDateStringIST(new Date());
}

export function getTomorrowDateString(): string {
    const now = new Date();
    const istMs = now.getTime() + (now.getTimezoneOffset() + IST_OFFSET_MINUTES) * 60_000;
    const tomorrow = new Date(istMs + 86_400_000);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
        console.warn(`[slotControl] getOrderCountForSlot(${date}, ${slotKey}) fallback to 0 (permission/network):`, err);
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

// ─── Unified Slot Availability ────────────────────────────

export interface AvailableSlot {
    key: string;
    label: string;
    startHour: number;
    orderCount: number;
    maxOrders: number;
}

export interface SlotAvailabilityResult {
    shopClosed: boolean;
    date: string;
    isToday: boolean;
    slots: AvailableSlot[];
    shopClosedToday?: boolean;
}

export async function getAvailableSlots(date: string): Promise<SlotAvailabilityResult> {
    const today = getTodayDateString();
    const isToday = date === today;

    try {
        const [control, counts] = await Promise.all([
            fetchDailySlotControl(date),
            getOrderCountsForAllSlots(date),
        ]);

        if (control.shopClosed && isToday) {
            const tomorrow = getTomorrowDateString();
            const tomorrowResult = await getAvailableSlots(tomorrow);
            return { ...tomorrowResult, shopClosedToday: true };
        }

        const available: AvailableSlot[] = [];
        for (const slotDef of DELIVERY_SLOT_KEYS) {
            const key = slotDef.key as SlotKey;
            const slotConfig = control.slots[key] ?? { enabled: true, maxOrders: DEFAULT_SLOT_LIMIT };
            if (!slotConfig.enabled) continue;
            const orderCount = counts[key] ?? 0;
            if (orderCount >= slotConfig.maxOrders) continue;
            if (isSlotBlockedByBuffer(slotDef.startHour, isToday)) continue;
            available.push({
                key: slotDef.key,
                label: slotDef.label,
                startHour: slotDef.startHour,
                orderCount,
                maxOrders: slotConfig.maxOrders,
            });
        }

        if (available.length === 0 && isToday) {
            return getAvailableSlots(getTomorrowDateString());
        }

        return { shopClosed: control.shopClosed, date, isToday, slots: available };
    } catch (err) {
        console.error('[slotControl] getAvailableSlots failed, using failsafe defaults:', err);
        return {
            shopClosed: false,
            date,
            isToday,
            slots: DELIVERY_SLOT_KEYS
                .filter((s) => !isSlotBlockedByBuffer(s.startHour, isToday))
                .map((s) => ({
                    key: s.key,
                    label: s.label,
                    startHour: s.startHour,
                    orderCount: 0,
                    maxOrders: DEFAULT_SLOT_LIMIT,
                })),
        };
    }
}
