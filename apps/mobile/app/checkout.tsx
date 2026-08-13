import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import {
    collection,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { db, DELIVERY_ZONES, DeliveryType, OrderStatus, generateIdempotencyToken, validateMobile, formatCurrency, buildUpiDeepLink } from '@bismi/core';
import type { CartItem, AvailableSlot } from '@bismi/core';
import * as Linking from 'expo-linking';
import { useCart } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';
import { useSlots } from '../hooks/useSlots';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../constants/Colors';

// ─── Slot Picker ──────────────────────────────────────────
function SlotPicker({ selected, onSelect }: { selected: string; onSelect: (key: string, label: string) => void }) {
    const { result, loading } = useSlots();

    if (loading) return <LoadingSpinner label="Checking slot availability..." size="small" />;
    if (!result || result.slots.length === 0) return (
        <Text style={styles.noSlotsText}>No slots available. Please try again later.</Text>
    );

    return (
        <View style={styles.slotsGrid}>
            {result.slots.map((slot: AvailableSlot) => {
                const isSelected = selected === slot.key;
                const isFull = slot.orderCount >= slot.maxOrders;
                return (
                    <TouchableOpacity
                        key={slot.key}
                        style={[styles.slotChip, isSelected && styles.slotChipActive, isFull && styles.slotChipFull]}
                        onPress={() => !isFull && onSelect(slot.key, slot.label)}
                        disabled={isFull}
                    >
                        <Text style={[styles.slotChipText, isSelected && styles.slotChipTextActive]}>
                            {slot.label}
                        </Text>
                        {isFull && <Text style={styles.slotFullText}>Full</Text>}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ─── Checkout Screen ──────────────────────────────────────
export default function CheckoutScreen() {
    const { items, subtotal, clearCart } = useCart();
    const { customer, saveCustomer } = useCustomer();

    const [name, setName] = useState(customer?.name ?? '');
    const [mobile, setMobile] = useState(customer?.mobile ?? '');
    const [address, setAddress] = useState('');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.DELIVERY);
    const [selectedZone, setSelectedZone] = useState('');
    const [selectedSlotKey, setSelectedSlotKey] = useState('');
    const [selectedSlotLabel, setSelectedSlotLabel] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpiPay = async (orderId: string) => {
        const upiUrl = buildUpiDeepLink(subtotal, orderId, name);
        const canOpen = await Linking.canOpenURL(upiUrl);
        if (canOpen) {
            await Linking.openURL(upiUrl);
        } else {
            Alert.alert('UPI App Required', 'Please install PhonePe, GPay, or Paytm on your device.');
        }
    };

    const handlePlaceOrder = async () => {
        if (!name.trim()) return Alert.alert('Missing Info', 'Please enter your name.');
        if (!validateMobile(mobile)) return Alert.alert('Invalid Mobile', 'Enter a valid 10-digit Indian mobile number.');
        if (deliveryType === DeliveryType.DELIVERY && !selectedZone) return Alert.alert('Select Zone', 'Please select a delivery zone.');
        if (!selectedSlotKey) return Alert.alert('Select Slot', 'Please select a delivery time slot.');
        if (deliveryType === DeliveryType.DELIVERY && !address.trim()) return Alert.alert('Missing Address', 'Please enter your house address.');

        setIsSubmitting(true);

        try {
            await saveCustomer({ name: name.trim(), mobile: mobile.trim() });

            const zone = DELIVERY_ZONES.find((z) => z.key === selectedZone);
            const idempotencyToken = generateIdempotencyToken();

            const orderItems = items.map((item: CartItem) => ({
                meatTypeId: item.meatTypeId,
                meatName: item.meatName,
                unit: item.unit,
                ...(item.unit === 'kg' ? { kg: item.kg, pricePerKg: item.pricePerKg } : { pieces: item.pieces, pricePerPiece: item.pricePerPiece }),
                cuttingPreference: item.cuttingPreference ?? null,
                subtotal: item.unit === 'piece'
                    ? (item.pieces ?? 0) * (item.pricePerPiece ?? 0)
                    : (item.kg ?? 0) * (item.pricePerKg ?? 0),
            }));

            const today = new Date().toISOString().split('T')[0];

            const orderRef = await addDoc(collection(db, 'orders'), {
                customerName: name.trim(),
                mobile: mobile.trim(),
                items: orderItems,
                subtotal,
                deliveryCharge: 0,
                totalAmount: subtotal,
                deliveryType,
                address: deliveryType === DeliveryType.DELIVERY ? address.trim() : 'Pickup from shop',
                deliveryZone: selectedZone || null,
                deliveryZoneLabel: zone?.label ?? null,
                deliverySlot: selectedSlotKey,
                deliveryTimeSlot: selectedSlotLabel,
                deliveryDate: today,
                paymentMethod: paymentMethod === 'upi' ? 'UPI (Paytm/GPay)' : 'Cash on Delivery',
                status: OrderStatus.PENDING,
                idempotencyToken,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            if (paymentMethod === 'upi') {
                await handleUpiPay(orderRef.id);
            }

            clearCart();
            router.replace(`/order-confirm/${orderRef.id}`);
        } catch (err) {
            console.error('[Checkout] Order failed:', err);
            Alert.alert('Order Failed', 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Customer Info */}
                <Card style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="person-outline" size={18} color={Colors.brand.crimson} />
                        <Text style={styles.sectionTitle}>Your Details</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Your Name"
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Mobile Number (10 digits)"
                        value={mobile}
                        onChangeText={setMobile}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                </Card>

                {/* Delivery Type */}
                <Card style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="location-outline" size={18} color={Colors.brand.crimson} />
                        <Text style={styles.sectionTitle}>Delivery Type</Text>
                    </View>
                    <View style={styles.toggleRow}>
                        {(['delivery', 'pickup'] as const).map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.toggleBtn, deliveryType === type && styles.toggleBtnActive]}
                                onPress={() => setDeliveryType(type === 'delivery' ? DeliveryType.DELIVERY : DeliveryType.PICKUP)}
                            >
                                <Ionicons
                                    name={type === 'delivery' ? 'home-outline' : 'storefront-outline'}
                                    size={16}
                                    color={deliveryType === type ? Colors.brand.crimson : Colors.gray[500]}
                                />
                                <Text style={[styles.toggleText, deliveryType === type && styles.toggleTextActive]}>
                                    {type === 'delivery' ? 'Home Delivery' : 'Shop Pickup'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {deliveryType === DeliveryType.DELIVERY && (
                        <>
                            <Text style={styles.subLabel}>Select Your Area</Text>
                            <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
                                {DELIVERY_ZONES.map((zone) => (
                                    <TouchableOpacity
                                        key={zone.key}
                                        style={[styles.zoneItem, selectedZone === zone.key && styles.zoneItemActive]}
                                        onPress={() => setSelectedZone(zone.key)}
                                    >
                                        <Text style={[styles.zoneText, selectedZone === zone.key && styles.zoneTextActive]}>
                                            {zone.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <TextInput
                                style={[styles.input, { marginTop: Spacing.sm }]}
                                placeholder="House No / Street / Landmark"
                                value={address}
                                onChangeText={setAddress}
                                multiline
                                numberOfLines={2}
                            />
                        </>
                    )}
                </Card>

                {/* Delivery Slot */}
                <Card style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="time-outline" size={18} color={Colors.brand.crimson} />
                        <Text style={styles.sectionTitle}>Delivery Time Slot</Text>
                    </View>
                    <SlotPicker
                        selected={selectedSlotKey}
                        onSelect={(key, label) => { setSelectedSlotKey(key); setSelectedSlotLabel(label); }}
                    />
                </Card>

                {/* Payment */}
                <Card style={styles.section}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="card-outline" size={18} color={Colors.brand.crimson} />
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                    </View>
                    <View style={styles.paymentOptions}>
                        <TouchableOpacity
                            style={[styles.paymentOption, paymentMethod === 'upi' && styles.paymentOptionActive]}
                            onPress={() => setPaymentMethod('upi')}
                        >
                            <FontAwesome5 name="mobile-alt" size={22} color={paymentMethod === 'upi' ? Colors.brand.crimson : Colors.gray[500]} />
                            <View>
                                <Text style={styles.paymentTitle}>Pay via UPI</Text>
                                <Text style={styles.paymentSub}>Opens PhonePe / GPay / Paytm</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]}
                            onPress={() => setPaymentMethod('cod')}
                        >
                            <Ionicons name="cash-outline" size={24} color={paymentMethod === 'cod' ? Colors.brand.crimson : Colors.gray[500]} />
                            <View>
                                <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                                <Text style={styles.paymentSub}>Pay cash or UPI at delivery</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Total & Place Order */}
                <Card style={[styles.section, { marginBottom: Spacing['2xl'] }]}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
                    </View>
                    <Badge label="FREE DELIVERY" variant="success" style={{ marginBottom: Spacing.md }} />

                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSubmitting}
                        onPress={handlePlaceOrder}
                        rightIcon={<Ionicons name="checkmark-circle" size={18} color={Colors.white} />}
                    >
                        {paymentMethod === 'upi' ? `Pay ${formatCurrency(subtotal)} & Place Order` : 'Place Order (COD)'}
                    </Button>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.brand.cream },
    scrollContent: { padding: Spacing.md, gap: Spacing.md },

    section: { gap: 0 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand.navy },

    input: {
        borderWidth: 1,
        borderColor: Colors.gray[200],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        fontSize: FontSize.base,
        color: Colors.brand.navy,
        backgroundColor: Colors.gray[50],
        marginBottom: Spacing.sm,
    },

    // Delivery toggle
    toggleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray[100],
        borderWidth: 2,
        borderColor: Colors.transparent,
        gap: 6,
    },
    toggleBtnActive: { borderColor: Colors.brand.crimson, backgroundColor: '#fff0f0' },
    toggleText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.gray[500] },
    toggleTextActive: { color: Colors.brand.crimson },

    subLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.gray[600], marginBottom: Spacing.sm },

    // Zone list
    zoneItem: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.sm,
        marginBottom: 4,
        backgroundColor: Colors.gray[50],
    },
    zoneItemActive: { backgroundColor: '#fff0f0', borderLeftWidth: 3, borderLeftColor: Colors.brand.crimson },
    zoneText: { fontSize: FontSize.xs, color: Colors.gray[700] },
    zoneTextActive: { color: Colors.brand.crimson, fontWeight: FontWeight.semibold },

    // Slots
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    slotChip: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.gray[100],
        borderWidth: 2,
        borderColor: Colors.transparent,
    },
    slotChipActive: { borderColor: Colors.brand.crimson, backgroundColor: '#fff0f0' },
    slotChipFull: { opacity: 0.4 },
    slotChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.gray[600] },
    slotChipTextActive: { color: Colors.brand.crimson },
    slotFullText: { fontSize: 9, color: Colors.error, marginTop: 2 },
    noSlotsText: { fontSize: FontSize.xs, color: Colors.gray[500] },

    // Payment
    paymentOptions: { gap: Spacing.sm },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray[50],
        borderWidth: 2,
        borderColor: Colors.transparent,
        gap: Spacing.md,
    },
    paymentOptionActive: { borderColor: Colors.brand.crimson, backgroundColor: '#fff0f0' },
    paymentTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.brand.navy },
    paymentSub: { fontSize: FontSize.xs, color: Colors.gray[500], marginTop: 2 },

    // Total
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    totalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand.navy },
    totalValue: { fontSize: FontSize['2xl'], fontWeight: FontWeight.extrabold, color: Colors.brand.crimson },
});
