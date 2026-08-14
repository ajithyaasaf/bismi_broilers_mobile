import { useState, useEffect, useCallback } from 'react';
import { getAvailableSlots, getTodayDateString } from '@bismi/core';
import type { SlotAvailabilityResult, DeliverySlot } from '@bismi/core';

/**
 * Fetch rich delivery slots and availability for a specified date (IST).
 * Defaults to today.
 */
export function useSlots(date?: string) {
    const [result, setResult] = useState<SlotAvailabilityResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const targetDate = date ?? getTodayDateString();

    const fetchSlots = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await getAvailableSlots(targetDate);
            setResult(res);
        } catch (err) {
            console.error('[useSlots]', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch slots');
        } finally {
            setLoading(false);
        }
    }, [targetDate]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    return {
        result,
        slots: result?.slots ?? ([] as DeliverySlot[]),
        isFullyUnavailable: result?.isFullyUnavailable ?? false,
        loading,
        error,
        refresh: fetchSlots,
    };
}
