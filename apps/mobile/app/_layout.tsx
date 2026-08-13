import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartProvider } from '../context/CartContext';
import { CustomerProvider } from '../context/CustomerContext';
import { Colors } from '../constants/Colors';

import { FloatingCartBar } from '../components/ui/FloatingCartBar';

/**
 * Root Layout — wraps every screen with global providers.
 * Order: GestureHandler > SafeArea > Customer > Cart > Stack Navigation
 */
export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <CustomerProvider>
                    <CartProvider>
                        <StatusBar style="light" />
                        <Stack
                            screenOptions={{
                                headerStyle: { backgroundColor: Colors.brand.crimson },
                                headerTintColor: Colors.white,
                                headerTitleStyle: { fontWeight: '700', fontSize: 18 },
                                contentStyle: { backgroundColor: Colors.brand.cream },
                                animation: 'slide_from_right',
                            }}
                        >
                            {/* Tab navigator — no header here (tabs have their own) */}
                            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                            {/* Product Detail */}
                            <Stack.Screen
                                name="product/[id]"
                                options={{ title: 'Product', headerBackTitle: 'Back' }}
                            />

                            {/* Checkout */}
                            <Stack.Screen
                                name="checkout"
                                options={{
                                    title: 'Checkout',
                                    headerBackTitle: 'Cart',
                                    presentation: 'card',
                                }}
                            />

                            {/* Order Confirmation */}
                            <Stack.Screen
                                name="order-confirm/[id]"
                                options={{
                                    title: 'Order Confirmed!',
                                    headerBackVisible: false, // Cannot go back after order placed
                                    gestureEnabled: false,
                                }}
                            />
                        </Stack>
                        <FloatingCartBar />
                    </CartProvider>
                </CustomerProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
