import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCart } from '../../context/CartContext';
import type { MeatType } from '@bismi/core';
import { Colors, FontSize, FontWeight, FontFamily, BorderRadius, Spacing } from '../../constants/Colors';

interface InlineStepperProps {
    product: MeatType;
    compact?: boolean;
    fullWidth?: boolean;
}

const STEP = 0.25;
const MIN_KG = 0.5;

export function InlineStepper({ product, compact = false, fullWidth = false }: InlineStepperProps) {
    const { items, addItem, updateQuantity, removeItem } = useCart();

    const cartItem = items.find((i) => i.meatTypeId === product.id);
    const isPerPiece = product.unit === 'piece';

    const currentQty = cartItem
        ? (isPerPiece ? (cartItem.pieces ?? 1) : (cartItem.kg ?? MIN_KG))
        : 0;

    const handleAddInitial = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const initialQty = isPerPiece ? 1 : MIN_KG;
        addItem({
            meatTypeId: product.id,
            meatName: product.name,
            unit: product.unit,
            ...(isPerPiece ? { pieces: initialQty, pricePerPiece: product.pricePerPiece } : { kg: initialQty, pricePerKg: product.pricePerKg }),
            imageURL: product.imageURL,
        });
    };

    const handleIncrement = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!cartItem) return;
        if (isPerPiece) {
            updateQuantity(product.id, (cartItem.pieces ?? 1) + 1);
        } else {
            updateQuantity(product.id, (cartItem.kg ?? MIN_KG) + STEP);
        }
    };

    const handleDecrement = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!cartItem) return;
        if (isPerPiece) {
            const nextQty = (cartItem.pieces ?? 1) - 1;
            if (nextQty <= 0) {
                removeItem(product.id);
            } else {
                updateQuantity(product.id, nextQty);
            }
        } else {
            const nextQty = (cartItem.kg ?? MIN_KG) - STEP;
            if (nextQty < MIN_KG) {
                removeItem(product.id);
            } else {
                updateQuantity(product.id, nextQty);
            }
        }
    };

    // Inactive state: Large, bold "+ ADD" button
    if (!cartItem || currentQty === 0) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={[
                    styles.addBtn,
                    compact && styles.addBtnCompact,
                    fullWidth && styles.btnFullWidth,
                ]}
                onPress={handleAddInitial}
            >
                <Ionicons name="add" size={compact ? 14 : 16} color={Colors.white} />
                <Text style={[styles.addBtnText, compact && styles.addBtnTextCompact]}>ADD</Text>
            </TouchableOpacity>
        );
    }

    // Active state: Large, accessible stepper with clear bold numbers
    const qtyLabel = isPerPiece ? `${currentQty} pc` : `${currentQty} kg`;

    return (
        <View style={[
            styles.stepperContainer,
            compact && styles.stepperCompact,
            fullWidth && styles.btnFullWidth,
        ]}>
            <TouchableOpacity
                style={[styles.stepperBtn, compact && styles.stepperBtnCompact]}
                onPress={handleDecrement}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="remove" size={compact ? 15 : 18} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.stepperQtyBox}>
                <Text style={[styles.stepperQtyText, compact && styles.stepperQtyTextCompact]}>
                    {qtyLabel}
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.stepperBtn, compact && styles.stepperBtnCompact]}
                onPress={handleIncrement}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="add" size={compact ? 15 : 18} color={Colors.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.brand.crimson,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: 6,
        minWidth: 70,
        gap: 3,
    },
    addBtnCompact: {
        paddingHorizontal: 8,
        paddingVertical: 5,
        minWidth: 64,
    },
    btnFullWidth: {
        width: '100%',
        minWidth: '100%',
        paddingVertical: 6,
    },
    addBtnText: {
        color: Colors.white,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.5,
    },
    addBtnTextCompact: {
        fontSize: 11,
        fontWeight: FontWeight.bold,
    },

    // Large, accessible Stepper (+ / −)
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.brand.crimson,
        borderRadius: BorderRadius.md,
        paddingHorizontal: 4,
        paddingVertical: 3,
        minWidth: 84,
        flexShrink: 0,
    },
    stepperCompact: {
        minWidth: 76,
        paddingHorizontal: 3,
        paddingVertical: 3,
    },
    stepperBtn: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepperBtnCompact: {
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    stepperQtyBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    stepperQtyText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: FontWeight.extrabold,
    },
    stepperQtyTextCompact: {
        fontSize: 11.5,
        fontWeight: FontWeight.extrabold,
    },
});
