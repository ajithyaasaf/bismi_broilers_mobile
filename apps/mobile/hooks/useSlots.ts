import { useState, useEffect } from 'react';
import { getAvailableSlots, getTodayDateString } from '@bismi/core';
import type { SlotAvailabilityResult } from '@bismi/core';

/**
 * Fetch available delivery slots for a given date.
 * Defaults to today. Auto-falls back to tomorrow if all slots are full.
 */
export function useSlots(date?: string) {
    const [result, setResult] = useState<SlotAvailabilityResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const targetDate = date ?? getTodayDateString();

    useEffect(() => {
        setLoading(true);
        setError(null);

        getAvailableSlots(targetDate)
            .then((res) => {
                setResult(res);
                setLoading(false);
            })
            .catch((err: Error) => {
                console.error('[useSlots]', err);
                setError(err.message);
                setLoading(false);
            });
    }, [targetDate]);

    return { result, loading, error };
}
