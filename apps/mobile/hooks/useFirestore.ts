import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    onSnapshot,
    QueryConstraint,
    DocumentData,
    QuerySnapshot,
} from 'firebase/firestore';
import { db } from '@bismi/core';

/**
 * Generic real-time Firestore collection hook.
 * Automatically subscribes and unsubscribes with defensive error handling.
 */
export function useFirestoreCollection<T extends { id: string }>(
    collectionName: string,
    constraints: QueryConstraint[] = []
): { data: T[]; loading: boolean; error: string | null; refetch: () => void } {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    const refetch = useCallback(() => setTick((t) => t + 1), []);

    useEffect(() => {
        setLoading(true);
        setError(null);

        if (!db) {
            setLoading(false);
            return;
        }

        try {
            const ref = collection(db, collectionName);
            const q = query(ref, ...constraints);

            const unsubscribe = onSnapshot(
                q,
                (snapshot: QuerySnapshot<DocumentData>) => {
                    const docs = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    })) as T[];
                    setData(docs);
                    setLoading(false);
                },
                (err) => {
                    console.error(`[useFirestoreCollection] ${collectionName}:`, err);
                    setError(err.message);
                    setLoading(false);
                }
            );

            return unsubscribe;
        } catch (err) {
            console.error(`[useFirestoreCollection] init error on ${collectionName}:`, err);
            setError(err instanceof Error ? err.message : 'Database error');
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName, tick]);

    return { data, loading, error, refetch };
}
