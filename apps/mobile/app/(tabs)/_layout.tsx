import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Shadows } from '../../constants/Colors';
import { useCart } from '../../context/CartContext';

function CartIconWithBadge({ color, count }: { color: string; count: number }) {
    return (
        <View style={{ width: 26, height: 26 }}>
            <Ionicons name="cart-outline" size={24} color={color} />
            {count > 0 && (
                <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{count > 9 ? '9+' : count}</Text>
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
                tabBarInactiveTintColor: Colors.gray[400],
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopWidth: 1,
                    borderTopColor: Colors.gray[100],
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 6,
                    ...Shadows.sm,
                },
                tabBarLabelStyle: {
                    fontSize: FontSize.xs,
                    fontWeight: '600',
                },
                headerStyle: { backgroundColor: Colors.brand.crimson },
                headerTintColor: Colors.white,
                headerTitleStyle: { fontWeight: '700', fontSize: 18 },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={String(color)} />,
                }}
            />
            <Tabs.Screen
                name="menu"
                options={{
                    title: 'Menu',
                    headerTitle: 'Our Menu',
                    tabBarIcon: ({ color }) => <Ionicons name="restaurant-outline" size={22} color={String(color)} />,
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Cart',
                    headerTitle: 'Your Cart',
                    tabBarIcon: ({ color }) => <CartIconWithBadge color={String(color)} count={itemCount} />,
                }}
            />
            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    headerTitle: 'My Orders',
                    tabBarIcon: ({ color }) => <Ionicons name="receipt-outline" size={22} color={String(color)} />,
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -6,
        backgroundColor: Colors.brand.crimson,
        borderRadius: 10,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    cartBadgeText: {
        color: Colors.white,
        fontSize: 9,
        fontWeight: '700',
    },
});
