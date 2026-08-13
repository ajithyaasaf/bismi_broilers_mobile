import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, formatCurrency, SHOP_CONFIG } from '@bismi/core';
import type { MeatType } from '@bismi/core';
import { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { getProductImageSource } from '../../utils/imageResolver';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../constants/Colors';

const KG_STEP = 0.25;
const KG_MIN = 0.5;
const KG_MAX = 10;

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { addItem, items } = useCart();

    const [product, setProduct] = useState<MeatType | null>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState<number>(0.5); // kg or piece count
    const [cuttingPref, setCuttingPref] = useState('');

    useEffect(() => {
        if (!id) return;
        const ref = doc(db, 'meatTypes', id);
        const unsub = onSnapshot(ref, (snap) => {
            if (snap.exists()) {
                setProduct({ id: snap.id, ...snap.data() } as MeatType);
            }
            setLoading(false);
        });
        return unsub;
    }, [id]);

    const alreadyInCart = items.some((i) => i.meatTypeId === id);

    const increaseQty = () => {
        if (!product) return;
        if (product.unit === 'kg') {
            setQty((q) => Math.min(q + KG_STEP, KG_MAX));
        } else {
            setQty((q) => q + 1);
        }
    };

    const decreaseQty = () => {
        if (!product) return;
        if (product.unit === 'kg') {
            setQty((q) => Math.max(q - KG_STEP, KG_MIN));
        } else {
            setQty((q) => Math.max(q - 1, 1));
        }
    };

    const handleAddToCart = useCallback(() => {
        if (!product) return;
        const cartItem = {
            meatTypeId: product.id,
            meatName: product.name,
            unit: product.unit,
            ...(product.unit === 'kg' ? { kg: qty, pricePerKg: product.pricePerKg } : { pieces: qty, pricePerPiece: product.pricePerPiece }),
            cuttingPreference: cuttingPref || undefined,
            imageURL: product.imageURL,
        };
        addItem(cartItem);
        Alert.alert('Added to Cart! 🛒', `${qty} ${product.unit === 'kg' ? 'kg' : 'pcs'} of ${product.name} added.`, [
            { text: 'Continue Shopping' },
            { text: 'View Cart', onPress: () => router.push('/(tabs)/cart') },
        ]);
    }, [product, qty, cuttingPref, addItem]);

    if (loading) return <LoadingSpinner label="Loading..." fullScreen />;
    if (!product) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Product not found</Text>
                <Button onPress={() => router.back()}>Go Back</Button>
            </View>
        );
    }

    const displayQty = product.unit === 'kg' ? `${qty} kg` : `${qty} piece${qty !== 1 ? 's' : ''}`;
    const totalPrice = product.unit === 'kg'
        ? qty * product.pricePerKg
        : qty * (product.pricePerPiece ?? 0);
    const unitPrice = product.unit === 'kg'
        ? `${formatCurrency(product.pricePerKg)}/kg`
        : `${formatCurrency(product.pricePerPiece ?? 0)}/piece`;

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <Image source={getProductImageSource(product.imageURL)} style={styles.image} resizeMode="cover" />

                <View style={styles.body}>
                    {/* Name & Price */}
                    <View style={styles.header}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{product.name}</Text>
                            {product.localName && (
                                <Text style={styles.localName}>{product.localName}</Text>
                            )}
                        </View>
                        <View style={styles.priceTag}>
                            <Text style={styles.priceValue}>{unitPrice}</Text>
                        </View>
                    </View>

                    {/* Tags */}
                    <View style={styles.tagsRow}>
                        <Badge label="🚚 Free Delivery" variant="success" size="sm" />
                        {product.isAvailableToday === false && (
                            <Badge label="Not Available Today" variant="error" size="sm" />
                        )}
                        {product.todayLabel && (
                            <Badge label={product.todayLabel} variant="brand" size="sm" />
                        )}
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>{product.description}</Text>

                    {/* Quantity Selector */}
                    <View style={styles.qtySection}>
                        <Text style={styles.qtyLabel}>Quantity</Text>
                        <View style={styles.qtyControl}>
                            <TouchableOpacity style={styles.qtyBtn} onPress={decreaseQty}>
                                <Text style={styles.qtyBtnText}>−</Text>
                            </TouchableOpacity>
                            <View style={styles.qtyDisplay}>
                                <Text style={styles.qtyText}>{displayQty}</Text>
                            </View>
                            <TouchableOpacity style={styles.qtyBtn} onPress={increaseQty}>
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                        {product.unit === 'kg' && (
                            <Text style={styles.qtyHint}>Min 0.5 kg, steps of 0.25 kg</Text>
                        )}
                    </View>

                    {/* Kaadai cutting preference */}
                    {product.category === 'kadai' && (
                        <View style={styles.cuttingSection}>
                            <Text style={styles.qtyLabel}>Cutting Preference (Optional)</Text>
                            {['With Head', 'Without Head', 'Full Bird'].map((pref) => (
                                <TouchableOpacity
                                    key={pref}
                                    style={[styles.cuttingChip, cuttingPref === pref && styles.cuttingChipActive]}
                                    onPress={() => setCuttingPref(cuttingPref === pref ? '' : pref)}
                                >
                                    <Text style={[styles.cuttingChipText, cuttingPref === pref && styles.cuttingChipTextActive]}>
                                        {pref}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Total Price */}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
                    </View>

                    {/* Add to Cart */}
                    <Button
                        variant={alreadyInCart ? 'secondary' : 'primary'}
                        size="lg"
                        fullWidth
                        onPress={handleAddToCart}
                        disabled={product.isAvailableToday === false}
                        style={{ marginBottom: Spacing.md }}
                    >
                        {product.isAvailableToday === false
                            ? 'Not Available Today'
                            : alreadyInCart
                                ? '+ Add More to Cart'
                                : '🛒 Add to Cart'}
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.white },
    errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
    errorText: { fontSize: FontSize.lg, color: Colors.gray[600] },

    image: { width: '100%', height: 280 },
    body: { padding: Spacing.md },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
    name: { fontSize: FontSize['2xl'], fontWeight: FontWeight.extrabold, color: Colors.brand.navy, flex: 1, lineHeight: 30 },
    localName: { fontSize: FontSize.sm, color: Colors.gray[500], marginTop: 4 },
    priceTag: {
        backgroundColor: '#fff0f0',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        marginLeft: Spacing.sm,
        ...Shadows.sm,
    },
    priceValue: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.brand.crimson },

    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginBottom: Spacing.md },
    description: { fontSize: FontSize.base, color: Colors.gray[600], lineHeight: 24, marginBottom: Spacing.lg },

    qtySection: { marginBottom: Spacing.lg },
    qtyLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.brand.navy, marginBottom: Spacing.sm },
    qtyControl: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
    qtyBtn: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.brand.crimson,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.brand,
    },
    qtyBtnText: { color: Colors.white, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
    qtyDisplay: { flex: 1, alignItems: 'center', backgroundColor: Colors.gray[50], borderRadius: BorderRadius.md, paddingVertical: 10 },
    qtyText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.brand.navy },
    qtyHint: { fontSize: FontSize.xs, color: Colors.gray[400], marginTop: 6 },

    cuttingSection: { marginBottom: Spacing.lg, gap: Spacing.xs },
    cuttingChip: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray[100],
        borderWidth: 2,
        borderColor: Colors.transparent,
    },
    cuttingChipActive: { borderColor: Colors.brand.crimson, backgroundColor: '#fff0f0' },
    cuttingChipText: { fontSize: FontSize.sm, color: Colors.gray[600] },
    cuttingChipTextActive: { color: Colors.brand.crimson, fontWeight: FontWeight.semibold },

    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    totalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand.navy },
    totalValue: { fontSize: FontSize['2xl'], fontWeight: FontWeight.extrabold, color: Colors.brand.crimson },
});
