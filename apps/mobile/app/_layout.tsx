import React, { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/plus-jakarta-sans/useFonts';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { CartProvider } from '../context/CartContext';
import { CustomerProvider } from '../context/CustomerContext';
import { Colors, FontFamily } from '../constants/Colors';
import { FloatingCartBar } from '../components/ui/FloatingCartBar';

/**
 * Root Layout — wraps every screen with global providers.
 * Order: GestureHandler > SafeArea > Customer > Cart > Stack Navigation
 */
export default function RootLayout() {
    // Inject Google Fonts link dynamically on Web
    useEffect(() => {
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
            const fontId = 'google-font-plus-jakarta-sans';
            if (!document.getElementById(fontId)) {
                const link = document.createElement('link');
                link.id = fontId;
                link.rel = 'stylesheet';
                link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
                document.head.appendChild(link);
            }
        }
    }, []);

    // Load native font files on iOS/Android
    const [fontsLoaded] = useFonts({
        PlusJakartaSans_400Regular,
        PlusJakartaSans_500Medium,
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_700Bold,
        PlusJakartaSans_800ExtraBold,
    });

    if (!fontsLoaded && Platform.OS !== 'web') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.brand.cream }}>
                <ActivityIndicator size="large" color={Colors.brand.crimson} />
            </View>
        );
    }

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
                                headerTitleStyle: { fontFamily: FontFamily.bold, fontSize: 18 },
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
                                    headerBackVisible: false,
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
