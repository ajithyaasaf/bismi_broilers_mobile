import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
} from 'firebase/firestore';
import { db } from '@bismi/core';
import type { Order } from '@bismi/core';

/**
 * Fetch all orders for a customer mobile number (real-time).
 */
export function useOrders(mobile: string | null) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!mobile) {
            setOrders([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'orders'),
            where('mobile', '==', mobile),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snap) => {
                const docs = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as Order[];
                setOrders(docs);
                setLoading(false);
            },
            (err) => {
                console.error('[useOrders]', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [mobile]);

    return { orders, loading, error };
}

/**
 * Track a single order by ID (real-time).
 */
export function useOrderById(orderId: string | null) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const ref = doc(db, 'orders', orderId);

        const unsubscribe = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                setOrder({ id: snap.id, ...snap.data() } as Order);
                setNotFound(false);
            } else {
                setNotFound(true);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [orderId]);

    return { order, loading, notFound };
}
