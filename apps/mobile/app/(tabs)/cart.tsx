import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { formatCurrency, SHOP_CONFIG } from '@bismi/core';
import type { CartItem } from '@bismi/core';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/Colors';

// ─── Cart Item Row ────────────────────────────────────────
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

    return (
        <Card style={styles.itemCard} elevation="sm">
            <View style={styles.itemRow}>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.meatName}</Text>
                    {item.cuttingPreference && (
                        <Text style={styles.itemCut}>{item.cuttingPreference}</Text>
                    )}
                    <Text style={styles.itemPrice}>{formatCurrency(price)}</Text>
                </View>

                <View style={styles.itemControls}>
                    <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease} activeOpacity={0.8}>
                        <Ionicons name="remove" size={16} color={Colors.white} />
                    </TouchableOpacity>
                    <View style={styles.qtyDisplay}>
                        <Text style={styles.qtyText}>{qty} {unitLabel}</Text>
                    </View>
                    <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease} activeOpacity={0.8}>
                        <Ionicons name="add" size={16} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={14} color={Colors.gray[400]} />
                <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
        </Card>
    );
}

// ─── Empty Cart ───────────────────────────────────────────
function EmptyCart() {
    return (
        <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptySubtitle}>Explore our fresh cuts and add your items here!</Text>
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
        const qty = item.unit === 'piece' ? (item.pieces ?? 0) : (item.kg ?? 0);
        updateQuantity(item.meatTypeId, item.unit === 'kg' ? qty + STEP : qty + 1);
    };

    const handleDecrease = (item: CartItem) => {
        const qty = item.unit === 'piece' ? (item.pieces ?? 0) : (item.kg ?? 0);
        const minQty = item.unit === 'kg' ? 0.5 : 1;
        if (qty <= minQty) {
            removeItem(item.meatTypeId);
        } else {
            updateQuantity(item.meatTypeId, item.unit === 'kg' ? qty - STEP : qty - 1);
        }
    };

    const handleClear = () => {
        Alert.alert('Clear Cart', 'Remove all items from cart?', [
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
                        onRemove={() => removeItem(item.meatTypeId)}
                    />
                )}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={styles.listHeaderText}>{itemCount} item{itemCount !== 1 ? 's' : ''} in cart</Text>
                        <TouchableOpacity onPress={handleClear}>
                            <Text style={styles.clearText}>Clear All</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListFooterComponent={
                    <Card style={styles.summaryCard} elevation="md">
                        <Text style={styles.summaryTitle}>Order Summary</Text>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Charge</Text>
                            <Badge label="FREE DELIVERY" variant="success" size="sm" />
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryTotal}>Total Amount</Text>
                            <Text style={styles.summaryTotalValue}>{formatCurrency(subtotal)}</Text>
                        </View>

                        {isBelowMinimum && (
                            <View style={styles.minOrderBanner}>
                                <Ionicons name="alert-circle" size={16} color="#92400e" style={{ marginRight: 6 }} />
                                <Text style={styles.minOrderText}>
                                    Minimum order is {formatCurrency(SHOP_CONFIG.minimumOrderAmount)}. Add {formatCurrency(SHOP_CONFIG.minimumOrderAmount - subtotal)} more.
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
                    </Card>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.brand.cream },
    listContent: { padding: Spacing.md, gap: Spacing.sm },

    listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
    listHeaderText: { fontSize: FontSize.xs, color: Colors.gray[500] },
    clearText: { fontSize: FontSize.xs, color: Colors.brand.crimson, fontWeight: FontWeight.semibold },

    // Item card
    itemCard: { marginBottom: 0 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    itemInfo: { flex: 1, marginRight: Spacing.md },
    itemName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.brand.navy },
    itemCut: { fontSize: FontSize.xs, color: Colors.gray[500], marginTop: 2 },
    itemPrice: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand.crimson, marginTop: 4 },

    itemControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    qtyBtn: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.brand.crimson,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyDisplay: { minWidth: 56, alignItems: 'center' },
    qtyText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.brand.navy },

    removeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm, alignSelf: 'flex-start' },
    removeBtnText: { fontSize: FontSize.xs, color: Colors.gray[400] },

    // Summary
    summaryCard: { marginTop: Spacing.md },
    summaryTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand.navy, marginBottom: Spacing.md },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    summaryLabel: { fontSize: FontSize.sm, color: Colors.gray[600] },
    summaryValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.brand.navy },
    summaryDivider: { height: 1, backgroundColor: Colors.gray[200], marginVertical: Spacing.sm },
    summaryTotal: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.brand.navy },
    summaryTotalValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.brand.crimson },
    minOrderBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        marginTop: Spacing.sm,
    },
    minOrderText: { flex: 1, fontSize: FontSize.xs, color: '#92400e' },

    // Empty
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['2xl'] },
    emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.brand.navy, marginTop: Spacing.md },
    emptySubtitle: { fontSize: FontSize.sm, color: Colors.gray[500], marginTop: Spacing.xs, textAlign: 'center' },
});
