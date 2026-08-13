import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOrderById } from '../../hooks/useOrders';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate, buildWhatsAppUrl } from '@bismi/core';
import * as Linking from 'expo-linking';
import { Colors, FontSize, FontWeight, Spacing } from '../../constants/Colors';

export default function OrderConfirmScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { order, loading, notFound } = useOrderById(id ?? null);

    if (loading) return <LoadingSpinner label="Loading your order..." fullScreen />;

    if (notFound || !order) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.center}>
                    <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
                    <Text style={styles.errorText}>Order not found</Text>
                    <Button onPress={() => router.replace('/(tabs)')}>Go Home</Button>
                </View>
            </SafeAreaView>
        );
    }

    const shortId = order.id.slice(-6).toUpperCase();

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Success Header */}
                <View style={styles.successHeader}>
                    <View style={styles.successIconCircle}>
                        <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
                    </View>
                    <Text style={styles.successTitle}>Order Placed!</Text>
                    <Text style={styles.successSubtitle}>
                        Order #{shortId} received.{'\n'}We are preparing it now.
                    </Text>
                    <StatusBadge status={order.status} />
                </View>

                {/* Order Details */}
                <Card style={styles.section}>
                    <View style={styles.titleRow}>
                        <Ionicons name="bag-handle-outline" size={18} color={Colors.brand.crimson} />
                        <Text style={styles.sectionTitle}>Order Items</Text>
                    </View>
                    {order.items.map((item, i) => (
                        <View key={i} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.meatName}</Text>
                            <Text style={styles.itemQty}>
                                {item.unit === 'piece' ? `${item.pieces} pc` : `${item.kg} kg`}
                            </Text>
                            <Text style={styles.itemPrice}>{formatCurrency(item.subtotal)}</Text>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    <View style={styles.itemRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
                    </View>
                </Card>

                {/* Delivery Info */}
                <Card style={styles.section}>
                    <View style={styles.titleRow}>
                        <Ionicons name="location-outline" size={18} color={Colors.brand.crimson} />
                        <Text style={styles.sectionTitle}>Delivery Information</Text>
                    </View>
                    <InfoRow label="Name" value={order.customerName} />
                    <InfoRow label="Mobile" value={order.mobile} />
                    <InfoRow label="Type" value={order.deliveryType === 'delivery' ? 'Home Delivery' : 'Shop Pickup'} />
                    {order.deliveryZoneLabel && <InfoRow label="Area" value={order.deliveryZoneLabel} />}
                    {order.deliveryTimeSlot && <InfoRow label="Slot" value={order.deliveryTimeSlot} />}
                    <InfoRow label="Payment" value={order.paymentMethod ?? 'COD'} />
                    <InfoRow label="Placed" value={formatDate(order.createdAt)} />
                </Card>

                {/* Actions */}
                <View style={styles.actions}>
                    <Button
                        variant="outline"
                        fullWidth
                        onPress={() => Linking.openURL(buildWhatsAppUrl(order.id, order.customerName, order.totalAmount))}
                        leftIcon={<Ionicons name="logo-whatsapp" size={18} color={Colors.brand.crimson} />}
                    >
                        Chat on WhatsApp
                    </Button>
                    <Button
                        variant="primary"
                        fullWidth
                        onPress={() => router.push('/(tabs)/orders')}
                        style={{ marginTop: Spacing.sm }}
                        rightIcon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
                    >
                        Track My Order
                    </Button>
                    <Button
                        variant="ghost"
                        fullWidth
                        onPress={() => router.replace('/(tabs)')}
                        style={{ marginTop: Spacing.xs }}
                    >
                        Continue Shopping
                    </Button>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}:</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.brand.cream },
    scrollContent: { padding: Spacing.md, paddingBottom: Spacing['3xl'] },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
    errorText: { fontSize: FontSize.lg, color: Colors.gray[600] },

    successHeader: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        gap: Spacing.xs,
    },
    successIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#d1fae5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xs,
    },
    successTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.extrabold, color: Colors.brand.crimson },
    successSubtitle: { fontSize: FontSize.sm, color: Colors.gray[600], textAlign: 'center', lineHeight: 20 },

    section: { marginBottom: Spacing.md },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand.navy },

    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
    itemName: { flex: 1, fontSize: FontSize.sm, color: Colors.brand.navy },
    itemQty: { fontSize: FontSize.xs, color: Colors.gray[500], marginHorizontal: Spacing.sm },
    itemPrice: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.brand.navy },
    divider: { height: 1, backgroundColor: Colors.gray[200], marginVertical: Spacing.sm },
    totalLabel: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.brand.navy },
    totalValue: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.brand.crimson },

    infoRow: { flexDirection: 'row', marginBottom: Spacing.xs },
    infoLabel: { width: 70, fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.gray[500] },
    infoValue: { flex: 1, fontSize: FontSize.xs, color: Colors.brand.navy },

    actions: { gap: Spacing.xs },
});
