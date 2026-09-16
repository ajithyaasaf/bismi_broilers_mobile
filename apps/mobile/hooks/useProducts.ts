import { useState, useEffect } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
} from 'firebase/firestore';
import { db, CHICKEN_GROUPS } from '@bismi/core';
import type { MeatType } from '@bismi/core';
import { CloudinaryImages } from '../constants/CloudinaryImages';

export interface CategoryProducts {
    groupLabel: string;
    products: MeatType[];
}

/**
 * Curated offline / fallback catalog with Cloudinary CDN assets.
 * Guarantees the app NEVER crashes or renders blank screens even if Firestore is uninitialized or offline.
 */
export const FALLBACK_PRODUCTS: MeatType[] = [
    {
        id: 'chicken-curry-cut',
        name: 'Chicken Curry Cut',
        pricePerKg: 240,
        unit: 'kg',
        imageURL: CloudinaryImages.curryCuts,
        description: 'Fresh chicken cut into medium pieces, ideal for rich South Indian gravies & curries.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        todayLabel: 'Hot Selling',
        localName: 'கறி வெட்டு',
        updatedAt: null as any,
    },
    {
        id: 'chicken-biriyani-cut',
        name: 'Chicken Biriyani Cut',
        pricePerKg: 260,
        unit: 'kg',
        imageURL: CloudinaryImages.biryaniCut,
        description: 'Large, juicy cuts specially chosen for authentic Dum Biriyani.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        todayLabel: 'Chef Choice',
        localName: 'பிரியாணி வெட்டு',
        updatedAt: null as any,
    },
    {
        id: 'chicken-boneless',
        name: 'Chicken Boneless',
        pricePerKg: 320,
        unit: 'kg',
        imageURL: CloudinaryImages.chickenBoneless,
        description: '100% tender chicken meat without bone. Best for 65, butter chicken & chukka.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        todayLabel: 'Tender & Fresh',
        localName: 'எலும்பில்லாத கறி',
        updatedAt: null as any,
    },
    {
        id: 'chicken-small-curry-cut',
        name: 'Chicken Small Curry Cut',
        pricePerKg: 240,
        unit: 'kg',
        imageURL: CloudinaryImages.curryCutSmall,
        description: 'Bite-sized tender pieces for quick cooking curries and gravies.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        localName: 'சிறிய கறி வெட்டு',
        updatedAt: null as any,
    },
    {
        id: 'chicken-gravy-cut',
        name: 'Chicken Gravy Cut',
        pricePerKg: 240,
        unit: 'kg',
        imageURL: CloudinaryImages.gravyCut,
        description: 'Special bone-in cuts that absorb rich masala and gravy flavors.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        localName: 'கிரேவி வெட்டு',
        updatedAt: null as any,
    },
    {
        id: 'chicken-breast',
        name: 'Chicken Breast',
        pricePerKg: 340,
        unit: 'kg',
        imageURL: CloudinaryImages.chickenBreasts,
        description: 'Lean, high-protein chicken breast cut, perfect for fitness diets.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        localName: 'மார்பக கறி',
        updatedAt: null as any,
    },
    {
        id: 'chicken-drumsticks',
        name: 'Chicken Drumsticks',
        pricePerKg: 280,
        unit: 'kg',
        imageURL: CloudinaryImages.drumsticks,
        description: 'Juicy, succulent bone-in drumsticks. Ideal for roasting and barbecue.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        localName: 'லெக் பீஸ் (டிரம்ஸ்டிக்)',
        updatedAt: null as any,
    },
    {
        id: 'chicken-wings',
        name: 'Chicken Wings',
        pricePerKg: 220,
        unit: 'kg',
        imageURL: CloudinaryImages.chickenWings,
        description: 'Crispy skin wings for tandoori, deep fry, and spicy starters.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        localName: 'இறக்கைகள்',
        updatedAt: null as any,
    },
    {
        id: 'chicken-lollipop',
        name: 'Chicken Lollipop',
        pricePerKg: 300,
        unit: 'kg',
        imageURL: CloudinaryImages.chickenLollipop,
        description: 'Frenched wingettes shaped like lollipops, kid-friendly and party-ready.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        localName: 'லாலிபாப்',
        updatedAt: null as any,
    },
    {
        id: 'chicken-keema',
        name: 'Chicken Keema',
        pricePerKg: 330,
        unit: 'kg',
        imageURL: CloudinaryImages.chickenKeema,
        description: 'Finely minced chicken for samosas, patties, koftas, and keema dosa.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        localName: 'கீமா',
        updatedAt: null as any,
    },
    {
        id: 'country-chicken',
        name: 'Country Chicken (Naatu Kozhi)',
        pricePerKg: 420,
        unit: 'kg',
        imageURL: CloudinaryImages.countryChicken,
        description: 'Authentic free-range country chicken. Rich in traditional flavor and nourishment.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        localName: 'நாட்டுக்கோழி',
        updatedAt: null as any,
    },
    {
        id: 'kaadai-meat',
        name: 'Kaadai (Farm Quail)',
        pricePerKg: 0,
        pricePerPiece: 50,
        unit: 'piece',
        imageURL: CloudinaryImages.quailMeat,
        description: 'Whole cleaned farm-raised quail. Rich in iron and protein.',
        category: 'kadai',
        isActive: true,
        isAvailableToday: true,
        localName: 'காடை',
        updatedAt: null as any,
    },
    {
        id: 'white-egg',
        name: 'White Egg',
        pricePerKg: 0,
        pricePerPiece: 6,
        unit: 'piece',
        imageURL: CloudinaryImages.whiteEgg,
        description: 'Farm fresh grade-A poultry eggs.',
        category: 'chicken',
        isActive: true,
        isAvailableToday: true,
        localName: 'முட்டை',
        updatedAt: null as any,
    },
    {
        id: 'quail-egg',
        name: 'Quail Egg (Kaadai Muttai)',
        pricePerKg: 0,
        pricePerPiece: 4,
        unit: 'piece',
        imageURL: CloudinaryImages.quailEgg,
        description: 'Nutrient-packed kaadai eggs.',
        category: 'kadai',
        isActive: true,
        isAvailableToday: true,
        localName: 'காடை முட்டை',
        updatedAt: null as any,
    },
];

/**
 * Fetch products by category with real-time updates and offline fallback.
 */
export function useProducts(category: string) {
    const fallbackCategoryProducts = FALLBACK_PRODUCTS.filter((p) => p.category === category);
    const [products, setProducts] = useState<MeatType[]>(fallbackCategoryProducts);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!category) return;

        // Defensive guard: if db is not initialized, serve fallback data cleanly
        if (!db) {
            setProducts(fallbackCategoryProducts);
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const q = query(
                collection(db, 'meatTypes'),
                where('category', '==', category),
                where('isActive', '==', true),
                orderBy('name', 'asc')
            );

            const unsubscribe = onSnapshot(
                q,
                (snap) => {
                    if (snap.empty) {
                        setProducts(fallbackCategoryProducts);
                    } else {
                        const docs = snap.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        })) as MeatType[];
                        setProducts(docs);
                    }
                    setLoading(false);
                },
                (err) => {
                    console.warn('[useProducts] snapshot error, using fallback:', err);
                    setError(err.message);
                    setProducts(fallbackCategoryProducts);
                    setLoading(false);
                }
            );

            return unsubscribe;
        } catch (err) {
            console.warn('[useProducts] query initialization error:', err);
            setProducts(fallbackCategoryProducts);
            setLoading(false);
        }
    }, [category]);

    return { products, loading, error };
}

/**
 * Fetch best-seller products with real-time updates and offline fallback.
 */
const BEST_SELLER_NAMES = [
    'Chicken Curry Cut',
    'Chicken Biriyani Cut',
    'Chicken Boneless',
];

export function useBestSellers() {
    const fallbackBestSellers = BEST_SELLER_NAMES
        .map((name) => FALLBACK_PRODUCTS.find((d) => d.name === name))
        .filter(Boolean) as MeatType[];

    const [products, setProducts] = useState<MeatType[]>(fallbackBestSellers);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Defensive guard: if db is null, immediately provide fallback
        if (!db) {
            setProducts(fallbackBestSellers);
            setLoading(false);
            return;
        }

        try {
            const q = query(
                collection(db, 'meatTypes'),
                where('name', 'in', BEST_SELLER_NAMES),
                where('isActive', '==', true)
            );

            const unsubscribe = onSnapshot(
                q,
                (snap) => {
                    if (snap.empty) {
                        setProducts(fallbackBestSellers);
                    } else {
                        const docs = snap.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        })) as MeatType[];
                        const sorted = BEST_SELLER_NAMES
                            .map((name) => docs.find((d) => d.name === name))
                            .filter(Boolean) as MeatType[];
                        setProducts(sorted.length > 0 ? sorted : fallbackBestSellers);
                    }
                    setLoading(false);
                },
                (err) => {
                    console.warn('[useBestSellers] snapshot error, using fallback:', err);
                    setProducts(fallbackBestSellers);
                    setLoading(false);
                }
            );

            return unsubscribe;
        } catch (err) {
            console.warn('[useBestSellers] query error, using fallback:', err);
            setProducts(fallbackBestSellers);
            setLoading(false);
        }
    }, []);

    return { products, loading };
}

/**
 * Fetch today's available products (admin-toggled daily) with offline fallback.
 */
export function useTodayAvailable() {
    const fallbackToday = FALLBACK_PRODUCTS.filter((p) => p.isAvailableToday);
    const [products, setProducts] = useState<MeatType[]>(fallbackToday);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Defensive guard: if db is null, immediately provide fallback
        if (!db) {
            setProducts(fallbackToday);
            setLoading(false);
            return;
        }

        try {
            const q = query(
                collection(db, 'meatTypes'),
                where('isActive', '==', true),
                where('isAvailableToday', '==', true)
            );

            const unsubscribe = onSnapshot(
                q,
                (snap) => {
                    if (snap.empty) {
                        setProducts(fallbackToday);
                    } else {
                        const docs = snap.docs.map((doc) => ({
                            id: doc.id,
                            ...doc.data(),
                        })) as MeatType[];
                        setProducts(docs.length > 0 ? docs : fallbackToday);
                    }
                    setLoading(false);
                },
                (err) => {
                    console.warn('[useTodayAvailable] snapshot error, using fallback:', err);
                    setProducts(fallbackToday);
                    setLoading(false);
                }
            );

            return unsubscribe;
        } catch (err) {
            console.warn('[useTodayAvailable] query error, using fallback:', err);
            setProducts(fallbackToday);
            setLoading(false);
        }
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
