import React, { useState, useRef, useEffect } from 'react';
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
 * [ COLOR COMBO 2 ]
 * Deep Navy (#1E293B) Base + Vibrant Crimson (#C81E1E) CTA Button.
 * - Sits on Bismi's classic slate navy foundation.
 * - Crimson CTA button provides a high-converting focal point.
 * - Smooth spring-sliding [ ✕ Close ] capsule on the right.
 */
export function FloatingCartBar() {
    const { itemCount, subtotal, clearCart } = useCart();
    const pathname = usePathname();
    const [isCloseActive, setIsCloseActive] = useState(false);
    const autoResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Spring slider animation (0 = normal View Cart, 1 = Close capsule expanded)
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Exit slide-down animation for whole bar
    const translateYExitAnim = useRef(new Animated.Value(0)).current;
    const opacityExitAnim = useRef(new Animated.Value(1)).current;

    // Hide on checkout, cart, or order confirmation screens
    const isHiddenRoute = pathname.includes('/cart') || pathname.includes('/checkout') || pathname.includes('/order-confirm');

    useEffect(() => {
        return () => {
            if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (itemCount === 0) {
            slideAnim.setValue(0);
            setIsCloseActive(false);
            if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
        }
    }, [itemCount]);

    if (itemCount === 0 || isHiddenRoute) return null;

    const handleViewCartPress = async () => {
        if (isCloseActive) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(tabs)/cart');
    };

    // Step 1: User taps the ✕ cross icon -> Spring slide from right to left
    const handleCrossTap = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setIsCloseActive(true);

        Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: false,
            bounciness: 4,
            speed: 15,
        }).start();

        // Auto-revert back after 3.5s
        if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);
        autoResetTimerRef.current = setTimeout(() => {
            revertCloseState();
        }, 3500);
    };

    const revertCloseState = () => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 2,
            speed: 16,
        }).start(() => {
            setIsCloseActive(false);
        });
    };

    // Step 2: User taps the revealed [ ✕ Close ] pill -> Clears cart and animates away
    const handleCloseConfirmTap = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        if (autoResetTimerRef.current) clearTimeout(autoResetTimerRef.current);

        Animated.parallel([
            Animated.timing(translateYExitAnim, {
                toValue: 60,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(opacityExitAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            clearCart();
            slideAnim.setValue(0);
            setIsCloseActive(false);
            translateYExitAnim.setValue(0);
            opacityExitAnim.setValue(1);
        });
    };

    // Animated Interpolations
    const viewCartOpacity = slideAnim.interpolate({
        inputRange: [0, 0.4, 1],
        outputRange: [1, 0, 0],
    });

    const viewCartTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -12],
    });

    const pillWidth = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [30, 80],
    });

    const pillBgColor = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255, 255, 255, 0.12)', '#DC2626'],
    });

    const closeTextOpacity = slideAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    const closeTextTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [10, 0],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: translateYExitAnim }],
                    opacity: opacityExitAnim,
                },
            ]}
            pointerEvents="box-none"
        >
            <View style={styles.bar}>
                {/* Left: Cart Icon, Items & Total */}
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
                        <Text style={styles.itemCountText} numberOfLines={1}>
                            {itemCount} item{itemCount !== 1 ? 's' : ''} added
                        </Text>
                        <Text style={styles.totalText} numberOfLines={1}>
                            {formatCurrency(subtotal)}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Right: Dynamic Action Area */}
                <View style={styles.rightContainer}>
                    {/* View Cart Button (Solid Crimson Pill + Crisp White Text) */}
                    <Animated.View
                        style={[
                            styles.viewCartWrapper,
                            {
                                opacity: viewCartOpacity,
                                transform: [{ translateX: viewCartTranslateX }],
                            },
                        ]}
                        pointerEvents={isCloseActive ? 'none' : 'auto'}
                    >
                        <TouchableOpacity
                            activeOpacity={0.88}
                            style={styles.viewCartButton}
                            onPress={handleViewCartPress}
                        >
                            <Text style={styles.viewCartText} numberOfLines={1}>View Cart</Text>
                            <Ionicons name="arrow-forward" size={13} color={Colors.white} />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Sliding Close Capsule Pill */}
                    <Animated.View
                        style={[
                            styles.slidingCapsule,
                            {
                                width: pillWidth,
                                backgroundColor: pillBgColor,
                            },
                        ]}
                    >
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={styles.slidingCapsuleTouchable}
                            onPress={isCloseActive ? handleCloseConfirmTap : handleCrossTap}
                            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                        >
                            <Ionicons
                                name="close"
                                size={isCloseActive ? 15 : 16}
                                color={isCloseActive ? Colors.white : '#94A3B8'}
                            />
                            {isCloseActive && (
                                <Animated.Text
                                    numberOfLines={1}
                                    style={[
                                        styles.slidingCloseText,
                                        {
                                            opacity: closeTextOpacity,
                                            transform: [{ translateX: closeTextTranslateX }],
                                        },
                                    ]}
                                >
                                    Close
                                </Animated.Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 65,
        left: Spacing.md,
        right: Spacing.md,
        zIndex: 999,
    },
    // [ COLOR COMBO 2 ]: Deep Navy Base
    bar: {
        backgroundColor: Colors.brand.navy, // #1E293B Deep Slate Navy
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.14)',
        paddingHorizontal: 12,
        paddingVertical: 9,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: Colors.brand.navy,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.32,
        shadowRadius: 10,
        elevation: 10,
        minHeight: 56,
    },

    // Left info
    leftInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        flex: 1,
        marginRight: 6,
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
        borderColor: Colors.brand.navy,
    },
    badgeDotText: {
        color: Colors.white,
        fontSize: 9,
        fontWeight: '800',
    },
    textColumn: {
        justifyContent: 'center',
        flexShrink: 1,
    },
    itemCountText: {
        color: '#94A3B8', // Cool slate gray
        fontSize: 10.5,
        fontWeight: FontWeight.medium,
    },
    totalText: {
        color: Colors.white,
        fontSize: FontSize.sm + 1,
        fontWeight: FontWeight.extrabold,
        letterSpacing: -0.2,
    },

    // Right Action Container
    rightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        position: 'relative',
        height: 36,
        minWidth: 130,
    },
    viewCartWrapper: {
        position: 'absolute',
        right: 36,
        flexDirection: 'row',
        alignItems: 'center',
    },
    // [ COLOR COMBO 2 ]: Vibrant Crimson Pill + Crisp White Text
    viewCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        backgroundColor: Colors.brand.crimson, // #C81E1E Vibrant Crimson
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: BorderRadius.full,
        flexShrink: 0,
        ...Shadows.sm,
    },
    viewCartText: {
        color: Colors.white,
        fontSize: FontSize.xs + 0.5,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.2,
        flexShrink: 0,
    },

    // Sliding Capsule
    slidingCapsule: {
        height: 30,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    slidingCapsuleTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        paddingHorizontal: 8,
        gap: 4,
    },
    slidingCloseText: {
        color: Colors.white,
        fontSize: FontSize.xs + 0.5,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.3,
    },
});
