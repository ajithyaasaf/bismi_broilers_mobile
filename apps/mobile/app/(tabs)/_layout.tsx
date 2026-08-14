import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, FontFamily, Shadows } from '../../constants/Colors';
import { useCart } from '../../context/CartContext';

interface TabIconProps {
    focused: boolean;
    activeIcon: keyof typeof Ionicons.glyphMap;
    inactiveIcon: keyof typeof Ionicons.glyphMap;
    badgeCount?: number;
}

/**
 * Modern Active-Indicator Tab Icon (Material 3 / iOS 18 style).
 * - Focused: Active filled icon inside a soft crimson tint pill (#FFF1F2).
 * - Inactive: Sleek outline icon in neutral cool slate (#94A3B8).
 */
function ModernTabIcon({ focused, activeIcon, inactiveIcon, badgeCount = 0 }: TabIconProps) {
    return (
        <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
            <Ionicons
                name={focused ? activeIcon : inactiveIcon}
                size={20}
                color={focused ? Colors.brand.crimson : '#94A3B8'}
            />
            {badgeCount > 0 && (
                <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
                </View>
            )}
        </View>
    );
}

export default function TabLayout() {
    const { itemCount } = useCart();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.brand.crimson,
                tabBarInactiveTintColor: '#94A3B8',
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
                    height: Platform.OS === 'ios' ? 88 : 72,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.06,
                    shadowRadius: 10,
                    elevation: 10,
                    // standard layout flow
                },
                tabBarItemStyle: {
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 2,
                },
                tabBarLabelStyle: {
                    fontSize: 10.5,
                    fontWeight: '700',
                    fontFamily: FontFamily.bold,
                    marginTop: 1,
                },
                headerStyle: { backgroundColor: Colors.brand.crimson },
                headerTintColor: Colors.white,
                headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            }}
        >
            {/* 1. Home Tab */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <ModernTabIcon
                            focused={focused}
                            activeIcon="home"
                            inactiveIcon="home-outline"
                        />
                    ),
                }}
            />

            {/* 2. Menu Tab */}
            <Tabs.Screen
                name="menu"
                options={{
                    title: 'Menu',
                    headerTitle: 'Our Menu',
                    tabBarIcon: ({ focused }) => (
                        <ModernTabIcon
                            focused={focused}
                            activeIcon="restaurant"
                            inactiveIcon="restaurant-outline"
                        />
                    ),
                }}
            />

            {/* 3. Cart Tab */}
            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Cart',
                    headerTitle: 'Your Cart',
                    tabBarIcon: ({ focused }) => (
                        <ModernTabIcon
                            focused={focused}
                            activeIcon="cart"
                            inactiveIcon="cart-outline"
                            badgeCount={itemCount}
                        />
                    ),
                }}
            />

            {/* 4. Orders Tab */}
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    headerTitle: 'My Orders',
                    tabBarIcon: ({ focused }) => (
                        <ModernTabIcon
                            focused={focused}
                            activeIcon="receipt"
                            inactiveIcon="receipt-outline"
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconWrapper: {
        width: 44,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: 1,
    },
    iconWrapperActive: {
        backgroundColor: '#FFF1F2', // Soft Crimson Tint Pill Indicator
    },
    cartBadge: {
        position: 'absolute',
        top: -3,
        right: 2,
        backgroundColor: Colors.brand.crimson,
        borderRadius: 9,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: Colors.white,
    },
    cartBadgeText: {
        color: Colors.white,
        fontSize: 8.5,
        fontWeight: '800',
    },
});
