import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from 'firebase/firestore';
import { db, CHICKEN_GROUPS } from '@bismi/core';
import type { MeatType } from '@bismi/core';

export interface CategoryProducts {
    groupLabel: string;
    products: MeatType[];
}

/**
 * Fetch products by category with real-time updates.
 * Mirrors the web menu page Firestore query.
 */
export function useProducts(category: string) {
    const [products, setProducts] = useState<MeatType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!category) return;

        setLoading(true);
        const q = query(
            collection(db, 'meatTypes'),
            where('category', '==', category),
            where('isActive', '==', true),
            orderBy('name', 'asc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                const docs = snap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                })) as MeatType[];
                setProducts(docs);
                setLoading(false);
            },
            (err) => {
                console.error('[useProducts]', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [category]);

    return { products, loading, error };
}

/**
 * Fetch best-seller products with real-time updates.
 */
const BEST_SELLER_NAMES = [
    'Chicken Curry Cut',
    'Chicken Biriyani Cut',
    'Chicken Boneless',
];

export function useBestSellers() {
    const [products, setProducts] = useState<MeatType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'meatTypes'),
            where('name', 'in', BEST_SELLER_NAMES),
            where('isActive', '==', true)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const docs = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as MeatType[];
            // Maintain best-seller order
            const sorted = BEST_SELLER_NAMES
                .map((name) => docs.find((d) => d.name === name))
                .filter(Boolean) as MeatType[];
            setProducts(sorted);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return { products, loading };
}

/**
 * Fetch today's available products (admin-toggled daily).
 */
export function useTodayAvailable() {
    const [products, setProducts] = useState<MeatType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'meatTypes'),
            where('isActive', '==', true),
            where('isAvailableToday', '==', true)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const docs = snap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as MeatType[];
            setProducts(docs);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return { products, loading };
}

/**
 * Group chicken products by CHICKEN_GROUPS config.
 */
export function groupChickenProducts(products: MeatType[]): CategoryProducts[] {
    const groups: CategoryProducts[] = [];
    const assigned = new Set<string>();

    for (const group of CHICKEN_GROUPS) {
        const matched = products.filter((p) => group.names.includes(p.name as never));
        if (matched.length > 0) {
            groups.push({ groupLabel: group.label, products: matched });
            matched.forEach((p) => assigned.add(p.id));
        }
    }

    const others = products.filter((p) => !assigned.has(p.id));
    if (others.length > 0) {
        groups.push({ groupLabel: 'Others', products: others });
    }

    return groups;
}
