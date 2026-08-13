import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateMobile } from '@bismi/core';

// ─── Customer Profile ─────────────────────────────────────
export interface CustomerProfile {
    name: string;
    mobile: string;
    deliveryZone?: string;
    address?: string;
}

interface CustomerContextValue {
    customer: CustomerProfile | null;
    isLoaded: boolean;
    saveCustomer: (profile: CustomerProfile) => Promise<void>;
    clearCustomer: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

const CUSTOMER_STORAGE_KEY = '@bismi/customer';

// ─── Provider ─────────────────────────────────────────────
export function CustomerProvider({ children }: { children: React.ReactNode }) {
    const [customer, setCustomer] = useState<CustomerProfile | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(CUSTOMER_STORAGE_KEY).then((raw) => {
            if (raw) {
                const parsed = JSON.parse(raw) as CustomerProfile;
                if (parsed.mobile && validateMobile(parsed.mobile)) {
                    setCustomer(parsed);
                }
            }
            setIsLoaded(true);
        });
    }, []);

    const saveCustomer = useCallback(async (profile: CustomerProfile) => {
        await AsyncStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(profile));
        setCustomer(profile);
    }, []);

    const clearCustomer = useCallback(async () => {
        await AsyncStorage.removeItem(CUSTOMER_STORAGE_KEY);
        setCustomer(null);
    }, []);

    return (
        <CustomerContext.Provider value={{ customer, isLoaded, saveCustomer, clearCustomer }}>
            {children}
        </CustomerContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────
export function useCustomer(): CustomerContextValue {
    const context = useContext(CustomerContext);
    if (!context) throw new Error('useCustomer must be used within <CustomerProvider>');
    return context;
}
