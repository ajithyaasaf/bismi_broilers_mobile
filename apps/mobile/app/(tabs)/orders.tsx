import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../hooks/useOrders';
import { useCustomer } from '../../context/CustomerContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatShortDate, validateMobile } from '@bismi/core';
import type { Order } from '@bismi/core';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../constants/Colors';

// ─── Order Card ───────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
    const shortId = order.id.slice(-6).toUpperCase();
    return (
        <Card style={styles.orderCard} elevation="sm">
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderId}>Order #{shortId}</Text>
                    <Text style={styles.orderDate}>{formatShortDate(order.createdAt)}</Text>
                </View>
                <StatusBadge status={order.status} />
            </View>

            <View style={styles.orderItems}>
                {order.items.map((item, i) => (
                    <Text key={i} style={styles.orderItemText}>
                        • {item.meatName} {item.unit === 'piece' ? `(${item.pieces} pc)` : `(${item.kg} kg)`}
                    </Text>
                ))}
            </View>

            <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>{formatCurrency(order.totalAmount)}</Text>
                <View style={styles.orderDeliveryBadge}>
                    <Ionicons name={order.deliveryType === 'pickup' ? 'storefront-outline' : 'bicycle-outline'} size={14} color={Colors.gray[500]} />
                    <Text style={styles.orderDeliveryText}>
                        {order.deliveryType === 'pickup' ? 'Shop Pickup' : (order.deliveryZoneLabel ?? 'Home Delivery')}
                    </Text>
                </View>
            </View>
        </Card>
    );
}

// ─── Mobile Login Form ────────────────────────────────────
function MobileLookup({ onSubmit }: { onSubmit: (mobile: string) => void }) {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');

    const handleLookup = () => {
        if (!validateMobile(input)) {
            setError('Enter a valid 10-digit mobile number.');
            return;
        }
        setError('');
        onSubmit(input);
    };

    return (
        <View style={styles.lookupContainer}>
            <View style={styles.lookupIconCircle}>
                <Ionicons name="receipt-outline" size={40} color={Colors.brand.crimson} />
            </View>
            <Text style={styles.lookupTitle}>Track Your Orders</Text>
            <Text style={styles.lookupSubtitle}>Enter the 10-digit mobile number used when ordering.</Text>
            <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                value={input}
                onChangeText={setInput}
                keyboardType="phone-pad"
                maxLength={10}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Button variant="primary" onPress={handleLookup} fullWidth style={{ marginTop: Spacing.xs }}>
                View Orders
            </Button>
        </View>
    );
}

// ─── Orders Screen ────────────────────────────────────────
export default function OrdersScreen() {
    const { customer } = useCustomer();
    const [lookupMobile, setLookupMobile] = useState<string | null>(customer?.mobile ?? null);
    const { orders, loading } = useOrders(lookupMobile);

    if (!lookupMobile) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <MobileLookup onSubmit={(m) => setLookupMobile(m)} />
            </SafeAreaView>
        );
    }

    if (loading) return <LoadingSpinner label="Loading your orders..." fullScreen />;

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <FlatList
                data={orders}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={styles.listHeaderTitle}>Orders for {lookupMobile}</Text>
                        <TouchableOpacity onPress={() => setLookupMobile(null)}>
                            <Text style={styles.changeText}>Change Number</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="time-outline" size={56} color={Colors.gray[300]} />
                        <Text style={styles.emptyTitle}>No Orders Found</Text>
                        <Text style={styles.emptySubtitle}>No order history for this mobile number yet.</Text>
                        <Button onPress={() => router.push('/(tabs)/menu')} style={{ marginTop: Spacing.md }}>
                            Browse Menu
                        </Button>
                    </View>
                }
                renderItem={({ item }) => <OrderCard order={item} />}
                ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.brand.cream },
    listContent: { padding: Spacing.md, paddingBottom: 32 },

    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    listHeaderTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.gray[600] },
    changeText: { fontSize: FontSize.xs, color: Colors.brand.crimson, fontWeight: FontWeight.semibold },

    // Order card
    orderCard: { marginBottom: 0 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
    orderId: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.brand.navy },
    orderDate: { fontSize: FontSize.xs, color: Colors.gray[500], marginTop: 2 },
    orderItems: { marginBottom: Spacing.sm },
    orderItemText: { fontSize: FontSize.xs, color: Colors.gray[600], lineHeight: 18 },
    orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.gray[100], paddingTop: Spacing.sm },
    orderTotal: { fontSize: FontSize.base, fontWeight: FontWeight.extrabold, color: Colors.brand.crimson },
    orderDeliveryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    orderDeliveryText: { fontSize: FontSize.xs, color: Colors.gray[500] },

    // Lookup
    lookupContainer: { flex: 1, padding: Spacing.xl, justifyContent: 'center', alignItems: 'center' },
    lookupIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#fff0f0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    lookupTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.brand.navy, marginBottom: Spacing.xs },
    lookupSubtitle: { fontSize: FontSize.xs, color: Colors.gray[500], textAlign: 'center', marginBottom: Spacing.lg },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: Colors.gray[200],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        fontSize: FontSize.base,
        marginBottom: Spacing.sm,
        backgroundColor: Colors.white,
    },
    errorText: { fontSize: FontSize.xs, color: Colors.error, alignSelf: 'flex-start', marginBottom: Spacing.sm },

    // Empty
    emptyContainer: { paddingTop: Spacing['3xl'], alignItems: 'center' },
    emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.gray[600], marginTop: Spacing.sm },
    emptySubtitle: { fontSize: FontSize.xs, color: Colors.gray[400], marginTop: Spacing.xs },
});
