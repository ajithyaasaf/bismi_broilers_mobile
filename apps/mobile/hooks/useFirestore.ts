import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    QueryConstraint,
    DocumentData,
    QuerySnapshot,
} from 'firebase/firestore';
import { db } from '@bismi/core';

/**
 * Generic real-time Firestore collection hook.
 * Automatically subscribes and unsubscribes.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName, tick]);

    return { data, loading, error, refetch };
}
