import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '@bismi/core';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../constants/Colors';

/**
 * Zomato / Swiggy style Floating Sticky Cart Bar.
 * Floats at the bottom above the tab bar whenever items > 0.
 * Automatically hidden on Cart, Checkout, and Order Confirm screens.
 */
export function FloatingCartBar() {
    const { items, itemCount, subtotal } = useCart();
    const pathname = usePathname();

    // Hide on checkout, cart, or order confirmation screens
    const isHiddenRoute = pathname.includes('/cart') || pathname.includes('/checkout') || pathname.includes('/order-confirm');
    if (itemCount === 0 || isHiddenRoute) return null;

    const handlePress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(tabs)/cart');
    };

    return (
        <View style={styles.container} pointerEvents="box-none">
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.bar}
                onPress={handlePress}
            >
                <View style={styles.leftInfo}>
                    <View style={styles.cartIconCircle}>
                        <Ionicons name="cart" size={18} color={Colors.white} />
                        <View style={styles.badgeDot}>
                            <Text style={styles.badgeDotText}>{itemCount}</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.itemCountText}>
                            {itemCount} item{itemCount !== 1 ? 's' : ''} added
                        </Text>
                        <Text style={styles.totalText}>{formatCurrency(subtotal)}</Text>
                    </View>
                </View>

                <View style={styles.rightAction}>
                    <Text style={styles.viewCartText}>View Cart</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 65, // Positioned right above the bottom tab bar
        left: Spacing.md,
        right: Spacing.md,
        zIndex: 999,
    },
    bar: {
        backgroundColor: Colors.brand.crimson,
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.md,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...Shadows.brand,
        elevation: 10,
    },
    leftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    cartIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: Colors.white,
        borderRadius: 8,
        minWidth: 14,
        height: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    badgeDotText: {
        color: Colors.brand.crimson,
        fontSize: 9,
        fontWeight: '800',
    },
    itemCountText: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: FontSize.xs,
        fontWeight: FontWeight.medium,
    },
    totalText: {
        color: Colors.white,
        fontSize: FontSize.base,
        fontWeight: FontWeight.extrabold,
    },
    rightAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
    },
    viewCartText: {
        color: Colors.white,
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
    },
});
