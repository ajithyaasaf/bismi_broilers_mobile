import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCart } from '../../context/CartContext';
import type { MeatType } from '@bismi/core';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../../constants/Colors';

interface InlineStepperProps {
    product: MeatType;
    compact?: boolean;
}

const STEP = 0.25;
const MIN_KG = 0.5;

/**
 * Zepto / Swiggy Instamart style Morphing Inline Quantity Stepper.
 * - Inactive state: High-contrast "+ ADD" button.
 * - Active state: Morphs inline to "−  0.5 kg  +" stepper with haptic feedback.
 */
export function InlineStepper({ product, compact = false }: InlineStepperProps) {
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

    // If NOT in cart -> render "+ ADD"
    if (!cartItem || currentQty === 0) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.addBtn, compact && styles.addBtnCompact]}
                onPress={handleAddInitial}
            >
                <Ionicons name="add" size={compact ? 12 : 14} color={Colors.white} />
                <Text style={[styles.addBtnText, compact && styles.addBtnTextCompact]}>ADD</Text>
            </TouchableOpacity>
        );
    }

    // If IN cart -> render Morphed Inline Stepper: "−  0.5 kg  +"
    const qtyLabel = isPerPiece ? `${currentQty} pc` : `${currentQty} kg`;

    return (
        <View style={[styles.stepperContainer, compact && styles.stepperCompact]}>
            <TouchableOpacity style={styles.stepperBtn} onPress={handleDecrement} activeOpacity={0.7}>
                <Ionicons name="remove" size={compact ? 12 : 14} color={Colors.white} />
            </TouchableOpacity>
            <View style={styles.stepperQtyBox}>
                <Text style={[styles.stepperQtyText, compact && styles.stepperQtyTextCompact]}>
                    {qtyLabel}
                </Text>
            </View>
            <TouchableOpacity style={styles.stepperBtn} onPress={handleIncrement} activeOpacity={0.7}>
                <Ionicons name="add" size={compact ? 12 : 14} color={Colors.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    // Add button: Solid Crimson background + crisp White bold text + subtle elevation
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.brand.crimson,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm + 4,
        paddingVertical: 6,
        minWidth: 68,
        gap: 2,
        shadowColor: Colors.brand.crimson,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
    },
    addBtnCompact: {
        paddingHorizontal: Spacing.xs + 4,
        paddingVertical: 4,
        minWidth: 58,
    },
    addBtnText: {
        color: Colors.white,
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        letterSpacing: 0.5,
    },
    addBtnTextCompact: {
        fontSize: 10,
    },

    // Morphed Stepper
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.brand.crimson,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: 2,
        paddingVertical: 2,
        minWidth: 78,
    },
    stepperCompact: {
        minWidth: 68,
    },
    stepperBtn: {
        paddingHorizontal: 5,
        paddingVertical: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepperQtyBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    stepperQtyText: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: FontWeight.bold,
    },
    stepperQtyTextCompact: {
        fontSize: 10,
    },
});
