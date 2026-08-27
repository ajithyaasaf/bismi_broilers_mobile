import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { formatCurrency, SHOP_CONFIG } from '@bismi/core';
import type { CartItem } from '@bismi/core';
import { Colors, FontSize, FontWeight, FontFamily, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { getProductImageSource } from '../../utils/imageResolver';

// ─── Modern Cart Item Row with Food Image ──────────────────
function CartItemRow({ item, onIncrease, onDecrease, onRemove }: {
    item: CartItem;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove: () => void;
}) {
    const qty = item.unit === 'piece' ? (item.pieces ?? 0) : (item.kg ?? 0);
    const unitLabel = item.unit === 'piece' ? 'pc' : 'kg';
    const price = item.unit === 'piece'
        ? qty * (item.pricePerPiece ?? 0)
        : qty * (item.pricePerKg ?? 0);

    const imageSource = getProductImageSource(item.imageURL, item.meatName);

    return (
        <View style={styles.itemCard}>
            {/* 1. Food Cut Thumbnail */}
            <View style={styles.imageWrapper}>
                <Image
                    source={imageSource}
                    style={styles.itemImage}
                    resizeMode="cover"
                />
            </View>

            {/* 2. Item Info */}
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                    {item.meatName}
                </Text>
                {Boolean(item.cuttingPreference) && (
                    <Text style={styles.itemCut} numberOfLines={1}>
                        {item.cuttingPreference}
                    </Text>
                )}
                <Text style={styles.itemPrice}>
                    {formatCurrency(price)}
                </Text>
            </View>

            {/* 3. Stepper Controls & Delete */}
            <View style={styles.controlsCol}>
                <View style={styles.stepperContainer}>
                    <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={onDecrease}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                    >
                        <Ionicons name="remove" size={14} color={Colors.white} />
                    </TouchableOpacity>

                    <View style={styles.qtyBox}>
                        <Text style={styles.qtyText} numberOfLines={1}>
                            {qty} {unitLabel}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.stepperBtn}
                        onPress={onIncrease}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                    >
                        <Ionicons name="add" size={14} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={onRemove}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Ionicons name="trash-outline" size={14} color={Colors.gray[400]} />
                    <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Empty Cart Screen ───────────────────────────────────
function EmptyCart() {
    return (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Ionicons name="cart-outline" size={48} color={Colors.brand.crimson} />
            </View>
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptySubtitle}>Explore our fresh cuts and add tender meats to your cart!</Text>
            <Button
                variant="primary"
                onPress={() => router.push('/(tabs)/menu')}
                style={{ marginTop: Spacing.lg }}
                rightIcon={<Ionicons name="arrow-forward" size={16} color={Colors.white} />}
            >
                Browse Menu
            </Button>
        </View>
    );
}

// ─── Cart Screen ─────────────────────────────────────────
export default function CartScreen() {
    const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart } = useCart();

    const STEP = 0.25;

    const handleIncrease = (item: CartItem) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const qty = item.unit === 'piece' ? (item.pieces ?? 0) : (item.kg ?? 0);
        updateQuantity(item.meatTypeId, item.unit === 'kg' ? qty + STEP : qty + 1);
    };

    const handleDecrease = (item: CartItem) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const qty = item.unit === 'piece' ? (item.pieces ?? 0) : (item.kg ?? 0);
        const minQty = item.unit === 'kg' ? 0.5 : 1;
        if (qty <= minQty) {
            removeItem(item.meatTypeId);
        } else {
            updateQuantity(item.meatTypeId, item.unit === 'kg' ? qty - STEP : qty - 1);
        }
    };

    const handleClear = () => {
        Alert.alert('Clear Cart', 'Remove all items from your cart?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear', style: 'destructive', onPress: clearCart },
        ]);
    };

    const isBelowMinimum = subtotal < SHOP_CONFIG.minimumOrderAmount;

    if (itemCount === 0) return <EmptyCart />;

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.meatTypeId}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <CartItemRow
                        item={item}
                        onIncrease={() => handleIncrease(item)}
                        onDecrease={() => handleDecrease(item)}
                        onRemove={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            removeItem(item.meatTypeId);
                        }}
                    />
                )}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={styles.listHeaderText}>
                            {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                        </Text>
                        <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Text style={styles.clearText}>Clear All</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListFooterComponent={
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryTitle}>Order Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Badge label="FREE DELIVERY" variant="success" size="sm" />
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryTotal}>Total to Pay</Text>
                            <Text style={styles.summaryTotalValue}>{formatCurrency(subtotal)}</Text>
                        </View>

                        {isBelowMinimum && (
                            <View style={styles.minOrderBanner}>
                                <Ionicons name="alert-circle" size={16} color="#92400e" style={{ marginRight: 6 }} />
                                <Text style={styles.minOrderText}>
                                    Minimum order is {formatCurrency(SHOP_CONFIG.minimumOrderAmount)}. Add {formatCurrency(SHOP_CONFIG.minimumOrderAmount - subtotal)} more to proceed.
                                </Text>
                            </View>
                        )}

                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            disabled={isBelowMinimum}
                            onPress={() => router.push('/checkout')}
                            style={{ marginTop: Spacing.md }}
                            rightIcon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
                        >
                            Proceed to Checkout
                        </Button>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FAF7F2' },
    listContent: { padding: Spacing.md, gap: 10, paddingBottom: 40 },

    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        paddingHorizontal: 2,
    },
    listHeaderText: {
        fontSize: FontSize.xs + 0.5,
        color: Colors.gray[600],
        fontWeight: FontWeight.semibold,
        fontFamily: FontFamily.semibold,
    },
    clearText: {
        fontSize: FontSize.xs,
        color: Colors.brand.crimson,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
    },

    // Cart Item Card with Food Image
    itemCard: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg, // 14px
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Shadows.sm,
    },
    imageWrapper: {
        width: 68,
        height: 68,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
        marginRight: 10,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    itemInfo: {
        flex: 1,
        justifyContent: 'center',
        marginRight: 8,
    },
    itemName: {
        fontSize: FontSize.sm + 0.5,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: Colors.brand.navy,
    },
    itemCut: {
        fontSize: 10.5,
        color: Colors.gray[500],
        fontFamily: FontFamily.regular,
        marginTop: 2,
    },
    itemPrice: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.extrabold,
        fontFamily: FontFamily.extrabold,
        color: Colors.brand.crimson,
        marginTop: 4,
    },

    // Controls
    controlsCol: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 6,
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.brand.crimson,
        borderRadius: BorderRadius.md,
        paddingHorizontal: 2,
        paddingVertical: 2,
        minWidth: 78,
    },
    stepperBtn: {
        paddingHorizontal: 6,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBox: {
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyText: {
        fontSize: 11,
        fontWeight: FontWeight.extrabold,
        fontFamily: FontFamily.bold,
        color: Colors.white,
    },
    removeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        paddingTop: 2,
    },
    removeBtnText: {
        fontSize: 10,
        color: Colors.gray[400],
        fontFamily: FontFamily.medium,
    },

    // Summary Card
    summaryCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        ...Shadows.sm,
    },
    summaryTitle: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: Colors.brand.navy,
        marginBottom: Spacing.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    summaryLabel: {
        fontSize: FontSize.sm,
        color: Colors.gray[600],
        fontFamily: FontFamily.medium,
        flexShrink: 0,
        paddingRight: 6,
    },
    summaryValue: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        fontFamily: FontFamily.semibold,
        color: Colors.brand.navy,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: Spacing.sm,
    },
    summaryTotal: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: Colors.brand.navy,
    },
    summaryTotalValue: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.extrabold,
        fontFamily: FontFamily.extrabold,
        color: Colors.brand.crimson,
    },
    minOrderBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        marginTop: Spacing.sm,
    },
    minOrderText: {
        flex: 1,
        fontSize: FontSize.xs,
        color: '#92400e',
        fontFamily: FontFamily.medium,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing['2xl'],
        backgroundColor: '#FAF7F2',
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: Colors.brand.navy,
    },
    emptySubtitle: {
        fontSize: FontSize.sm,
        color: Colors.gray[500],
        marginTop: Spacing.xs,
        textAlign: 'center',
        fontFamily: FontFamily.regular,
    },
});
