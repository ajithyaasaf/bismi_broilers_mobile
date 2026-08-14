import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '@bismi/core';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../constants/Colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Swiggy / Zomato style Floating Cart Bar with Right-to-Left Sliding "Close" Pill.
 * - Left side (Items + Price) always stays steady.
 * - Tapping [ ✕ ] on the right smoothly slides/morphs that right button area into a [ ✕ Close ] pill.
 * - Tapping [ ✕ Close ] clears the cart and smoothly drops the bar out of view.
 * - Auto-reverts back to [ View Cart → ] after 3.5s if not clicked.
 */
export function FloatingCartBar() {
    const { itemCount, subtotal, clearCart } = useCart();
    const pathname = usePathname();
    const [isCloseActive, setIsCloseActive] = useState(false);
    const autoResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Slide down exit animation
    const translateYAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    // Hide on checkout, cart, or order confirmation screens
    const isHiddenRoute = pathname.includes('/cart') || pathname.includes('/checkout') || pathname.includes('/order-confirm');

    useEffect(() => {
        return () => {
            if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (itemCount === 0) {
            setIsCloseActive(false);
            if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
        }
    }, [itemCount]);

    if (itemCount === 0 || isHiddenRoute) return null;

    const handleViewCartPress = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(tabs)/cart');
    };

    // Step 1: User taps the ✕ cross icon -> Right side smoothly expands to [ ✕ Close ]
    const handleCrossTap = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsCloseActive(true);

        // Auto-collapse back to View Cart after 3.5s
        if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
        autoResetTimerRef.current = setTimeout(() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setIsCloseActive(false);
        }, 3500);
    };

    // Step 2: User taps the revealed [ ✕ Close ] button -> Clears cart and animates away
    const handleCloseConfirmTap = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);

        // Smooth exit slide down
        Animated.parallel([
            Animated.timing(translateYAnim, {
                toValue: 60,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            clearCart();
            setIsCloseActive(false);
            translateYAnim.setValue(0);
            opacityAnim.setValue(1);
        });
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: translateYAnim }],
                    opacity: opacityAnim,
                },
            ]}
            pointerEvents="box-none"
        >
            <View style={styles.bar}>
                {/* Left: Cart Icon, Items & Total (Stays steady) */}
                <TouchableOpacity
                    activeOpacity={0.88}
                    style={styles.leftInfo}
                    onPress={handleViewCartPress}
                >
                    <View style={styles.cartIconCircle}>
                        <Ionicons name="cart" size={17} color={Colors.white} />
                        <View style={styles.badgeDot}>
                            <Text style={styles.badgeDotText}>{itemCount}</Text>
                        </View>
                    </View>
                    <View style={styles.textColumn}>
                        <Text style={styles.itemCountText}>
                            {itemCount} item{itemCount !== 1 ? 's' : ''} added
                        </Text>
                        <Text style={styles.totalText}>{formatCurrency(subtotal)}</Text>
                    </View>
                </TouchableOpacity>

                {/* Right: Morphing Button Container (Right-to-Left Slide Animation) */}
                <View style={styles.rightContainer}>
                    {!isCloseActive ? (
                        // Normal State: [ View Cart → ] + [ ✕ ]
                        <View style={styles.normalButtonGroup}>
                            <TouchableOpacity
                                activeOpacity={0.88}
                                style={styles.viewCartButton}
                                onPress={handleViewCartPress}
                            >
                                <Text style={styles.viewCartText}>View Cart</Text>
                                <Ionicons name="arrow-forward" size={13} color={Colors.white} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.crossCircleButton}
                                onPress={handleCrossTap}
                                hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                            >
                                <Ionicons name="close" size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        // Active Step 1: Smoothly Slid [ ✕ Close ] Action Pill
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.expandedCloseButton}
                            onPress={handleCloseConfirmTap}
                        >
                            <Ionicons name="close" size={15} color={Colors.white} />
                            <Text style={styles.expandedCloseText}>Close</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Animated.View>
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
        backgroundColor: '#0F172A', // Midnight Slate
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        paddingHorizontal: 12,
        paddingVertical: 9,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
        elevation: 10,
        minHeight: 56,
    },

    // Left info (Always steady)
    leftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        flex: 1,
    },
    cartIconCircle: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badgeDot: {
        position: 'absolute',
        top: -3,
        right: -3,
        backgroundColor: Colors.brand.crimson,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: '#0F172A',
    },
    badgeDotText: {
        color: Colors.white,
        fontSize: 9,
        fontWeight: '800',
    },
    textColumn: {
        justifyContent: 'center',
    },
    itemCountText: {
        color: '#94A3B8',
        fontSize: 10.5,
        fontWeight: FontWeight.medium,
    },
    totalText: {
        color: Colors.white,
        fontSize: FontSize.sm + 1,
        fontWeight: FontWeight.extrabold,
        letterSpacing: -0.2,
    },

    // Right Morphing Area
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    normalButtonGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    viewCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: Colors.brand.crimson,
        paddingHorizontal: 13,
        paddingVertical: 7.5,
        borderRadius: BorderRadius.full,
        ...Shadows.sm,
    },
    viewCartText: {
        color: Colors.white,
        fontSize: FontSize.xs + 0.5,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.2,
    },
    crossCircleButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Right-to-Left Expanded [ ✕ Close ] Pill
    expandedCloseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: '#DC2626', // Vibrant Red
        paddingHorizontal: 16,
        paddingVertical: 7.5,
        borderRadius: BorderRadius.full,
        ...Shadows.sm,
    },
    expandedCloseText: {
        color: Colors.white,
        fontSize: FontSize.xs + 0.5,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.3,
    },
});
