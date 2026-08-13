import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
    Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import {
    collection,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';
import {
    db,
    DELIVERY_ZONES,
    DeliveryType,
    OrderStatus,
    SHOP_CONFIG,
    generateIdempotencyToken,
    validateMobile,
    formatCurrency,
    buildUpiDeepLink,
    computeDeliveryCharge,
    getTodayDateString,
} from '@bismi/core';
import type { CartItem, AvailableSlot } from '@bismi/core';
import { useCart } from '../context/CartContext';
import { useCustomer } from '../context/CustomerContext';
import { useSlots } from '../hooks/useSlots';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getProductImageSource } from '../utils/imageResolver';
import { Colors, FontSize, FontWeight, FontFamily, Spacing, BorderRadius } from '../constants/Colors';

// ─── Delivery Slot Picker Component ───────────────────────
function SlotPicker({
    selectedKey,
    onSelect,
}: {
    selectedKey: string;
    onSelect: (key: string, label: string) => void;
}) {
    const { result, loading } = useSlots();

    if (loading) return <LoadingSpinner label="Checking slot availability..." size="small" />;
    if (!result || result.slots.length === 0) {
        return (
            <View style={styles.emptySlotContainer}>
                <Ionicons name="alert-circle-outline" size={20} color={Colors.warning} />
                <Text style={styles.noSlotsText}>No slots available for today. Tomorrow's slots opening soon.</Text>
            </View>
        );
    }

    const isTomorrow = !result.isToday;

    return (
        <View style={styles.slotContainer}>
            <View style={styles.slotHeaderRow}>
                <Text style={styles.slotHeaderLabel}>Preferred Delivery Time Slot</Text>
                {isTomorrow && (
                    <View style={styles.tomorrowBadge}>
                        <Text style={styles.tomorrowBadgeText}>TOMORROW</Text>
                    </View>
                )}
            </View>

            <View style={styles.slotsGrid}>
                {result.slots.map((slot: AvailableSlot) => {
                    const isSelected = selectedKey === slot.key;
                    const isFull = slot.orderCount >= slot.maxOrders;
                    return (
                        <TouchableOpacity
                            key={slot.key}
                            activeOpacity={0.7}
                            style={[
                                styles.slotChip,
                                isSelected && styles.slotChipActive,
                                isFull && styles.slotChipFull,
                            ]}
                            onPress={() => {
                                if (!isFull) {
                                    Haptics.selectionAsync();
                                    onSelect(slot.key, slot.label);
                                }
                            }}
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
        </View>
    );
}

// ─── Main Checkout Screen Component ───────────────────────
export default function CheckoutScreen() {
    const { items, subtotal, clearCart } = useCart();
    const { customer, saveCustomer } = useCustomer();
    const { result: slotResult } = useSlots();

    // ─── Form State ─────────────────────────────────────────
    const [name, setName] = useState(customer?.name ?? '');
    const [mobile, setMobile] = useState(customer?.mobile ?? '');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>(DeliveryType.DELIVERY);

    const [deliveryZoneSearch, setDeliveryZoneSearch] = useState(customer?.deliveryZone ?? '');
    const [selectedZone, setSelectedZone] = useState<string>(customer?.deliveryZone ?? '');
    const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);

    const [address, setAddress] = useState(customer?.address ?? '');
    const [selectedSlotKey, setSelectedSlotKey] = useState('');
    const [selectedSlotLabel, setSelectedSlotLabel] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedUpi, setCopiedUpi] = useState(false);
    const [isCartExpanded, setIsCartExpanded] = useState(true);
    const [isAutofilled, setIsAutofilled] = useState(Boolean(customer?.name || customer?.address));

    // ─── Dynamic Delivery Fee & Total Calculation ───────────
    const deliveryCharge = deliveryType === DeliveryType.DELIVERY ? computeDeliveryCharge(subtotal) : 0;
    const totalAmount = subtotal + deliveryCharge;
    const isMinOrderMet = subtotal >= SHOP_CONFIG.minimumOrderAmount;
    const minOrderDiff = SHOP_CONFIG.minimumOrderAmount - subtotal;

    // Auto-select first slot when slots load
    useEffect(() => {
        if (slotResult?.slots && slotResult.slots.length > 0 && !selectedSlotKey) {
            setSelectedSlotKey(slotResult.slots[0].key);
            setSelectedSlotLabel(slotResult.slots[0].label);
        }
    }, [slotResult, selectedSlotKey]);

    // Copy UPI ID to clipboard
    const handleCopyUpi = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Clipboard.setString(SHOP_CONFIG.upiId);
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2500);
    };

    // Clear saved autofill address
    const handleClearAutofill = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setName('');
        setMobile('');
        setDeliveryZoneSearch('');
        setSelectedZone('');
        setAddress('');
        setIsAutofilled(false);
    };

    // ─── Handle Payment & Deep Linking ──────────────────────
    const handleUpiPay = async (orderId: string) => {
        const upiUrl = buildUpiDeepLink(totalAmount, orderId, name);
        const canOpen = await Linking.canOpenURL(upiUrl);
        if (canOpen) {
            await Linking.openURL(upiUrl);
        } else {
            Alert.alert(
                'UPI App Not Found',
                `Please send ${formatCurrency(totalAmount)} directly to Shop UPI ID:\n\n${SHOP_CONFIG.upiId}`,
                [{ text: 'Copy UPI ID', onPress: handleCopyUpi }, { text: 'OK' }]
            );
        }
    };

    // ─── Submit Order Logic ─────────────────────────────────
    const handlePlaceOrder = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (!name.trim()) return Alert.alert('Missing Name', 'Please enter your full name.');
        if (!validateMobile(mobile)) return Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
        if (deliveryType === DeliveryType.DELIVERY && !selectedZone.trim()) {
            return Alert.alert('Missing Area', 'Please select or type your village / delivery area.');
        }
        if (deliveryType === DeliveryType.DELIVERY && !address.trim()) {
            return Alert.alert('Missing Address', 'Please enter your street name and landmark.');
        }
        if (deliveryType === DeliveryType.DELIVERY && !selectedSlotKey) {
            return Alert.alert('Select Slot', 'Please select a delivery time slot.');
        }
        if (!isMinOrderMet) {
            return Alert.alert(
                'Minimum Order Required',
                `Minimum order amount is ${formatCurrency(SHOP_CONFIG.minimumOrderAmount)}. Add ${formatCurrency(minOrderDiff)} more to continue.`
            );
        }

        setIsSubmitting(true);

        try {
            // Save profile details for seamless future 1-click checkout
            await saveCustomer({
                name: name.trim(),
                mobile: mobile.trim(),
                deliveryZone: selectedZone.trim(),
                address: address.trim(),
            });

            const zoneObj = DELIVERY_ZONES.find((z) => z.key === selectedZone || z.label === selectedZone);
            const idempotencyToken = generateIdempotencyToken();

            const orderItems = items.map((item: CartItem) => {
                const isPiece = item.unit === 'piece';
                return {
                    meatTypeId: item.meatTypeId,
                    meatName: item.meatName,
                    unit: item.unit,
                    ...(isPiece
                        ? { pieces: item.pieces, pricePerPiece: item.pricePerPiece }
                        : { kg: item.kg, pricePerKg: item.pricePerKg }),
                    cuttingPreference: item.cuttingPreference ?? null,
                    subtotal: isPiece
                        ? (item.pieces ?? 0) * (item.pricePerPiece ?? 0)
                        : (item.kg ?? 0) * (item.pricePerKg ?? 0),
                };
            });

            const todayStr = slotResult?.date ?? getTodayDateString();

            const orderRef = await addDoc(collection(db, 'orders'), {
                customerName: name.trim(),
                mobile: mobile.trim(),
                items: orderItems,
                subtotal: Number(subtotal.toFixed(2)),
                deliveryCharge: Number(deliveryCharge.toFixed(2)),
                totalAmount: Number(totalAmount.toFixed(2)),
                deliveryType,
                address: deliveryType === DeliveryType.DELIVERY ? address.trim() : 'Pickup from shop',
                deliveryZone: selectedZone || null,
                deliveryZoneLabel: zoneObj?.label ?? selectedZone ?? null,
                deliverySlot: selectedSlotKey || null,
                deliveryTimeSlot: selectedSlotLabel || null,
                deliveryDate: todayStr,
                paymentMethod: paymentMethod === 'upi' ? 'UPI (Paytm/GPay)' : 'Cash on Delivery',
                status: OrderStatus.PENDING,
                idempotencyToken,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            if (paymentMethod === 'upi') {
                await handleUpiPay(orderRef.id);
            }

            clearCart();
            router.replace(`/order-confirm/${orderRef.id}`);
        } catch (err) {
            console.error('[Checkout] Order submission failed:', err);
            Alert.alert(
                'Order Placement Error',
                'We could not place your order right now. Please check your internet connection and try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filtered delivery zones for instant search
    const filteredZones = DELIVERY_ZONES.filter((zone) =>
        zone.label.toLowerCase().includes(deliveryZoneSearch.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Banner */}
                <View style={styles.headerBanner}>
                    <Text style={styles.headerTitle}>Checkout</Text>
                    <Text style={styles.headerSubtitle}>Bismi Broilers • Mudukulathur Shop</Text>
                </View>

                {/* 1. Customer Contact Details */}
                <Card style={styles.cardSection}>
                    <View style={styles.cardHeaderRow}>
                        <Ionicons name="person" size={18} color={Colors.brand.crimson} />
                        <Text style={styles.cardTitle}>Your Contact Details</Text>
                    </View>

                    {isAutofilled && (
                        <View style={styles.autofillBadgeRow}>
                            <View style={styles.autofillTextGroup}>
                                <Ionicons name="sparkles" size={14} color={Colors.success} />
                                <Text style={styles.autofillBadgeText}>Auto-filled from previous order</Text>
                            </View>
                            <TouchableOpacity onPress={handleClearAutofill}>
                                <Text style={styles.clearBtnText}>Clear Form</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Mobile / WhatsApp Number *</Text>
                        <View style={styles.mobileInputRow}>
                            <View style={styles.countryCodeBadge}>
                                <Text style={styles.countryCodeText}>+91</Text>
                            </View>
                            <TextInput
                                style={[styles.input, styles.mobileInput]}
                                placeholder="9876543210"
                                value={mobile}
                                onChangeText={(val) => setMobile(val.replace(/\D/g, ''))}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                        />
                    </View>
                </Card>

                {/* 2. Delivery Option & Searchable Area Selector */}
                <Card style={styles.cardSection}>
                    <View style={styles.cardHeaderRow}>
                        <Ionicons name="location" size={18} color={Colors.brand.crimson} />
                        <Text style={styles.cardTitle}>Delivery Option</Text>
                    </View>

                    <View style={styles.toggleRow}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.toggleBtn, deliveryType === DeliveryType.DELIVERY && styles.toggleBtnActive]}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setDeliveryType(DeliveryType.DELIVERY);
                            }}
                        >
                            <Ionicons
                                name="bicycle"
                                size={18}
                                color={deliveryType === DeliveryType.DELIVERY ? Colors.brand.crimson : Colors.gray[500]}
                            />
                            <View>
                                <Text style={[styles.toggleText, deliveryType === DeliveryType.DELIVERY && styles.toggleTextActive]}>
                                    Home Delivery
                                </Text>
                                <Text style={styles.toggleSubtext}>
                                    {deliveryCharge === 0 ? 'FREE' : formatCurrency(deliveryCharge)}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.toggleBtn, deliveryType === DeliveryType.PICKUP && styles.toggleBtnActive]}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setDeliveryType(DeliveryType.PICKUP);
                            }}
                        >
                            <Ionicons
                                name="storefront"
                                size={18}
                                color={deliveryType === DeliveryType.PICKUP ? Colors.brand.crimson : Colors.gray[500]}
                            />
                            <View>
                                <Text style={[styles.toggleText, deliveryType === DeliveryType.PICKUP && styles.toggleTextActive]}>
                                    Shop Pickup
                                </Text>
                                <Text style={styles.toggleSubtext}>Free • Mudukulathur</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {deliveryType === DeliveryType.DELIVERY && (
                        <View style={styles.addressFormSpace}>
                            {/* Village / Area Search Bar */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Village / Delivery Area *</Text>
                                <View style={styles.searchBarRow}>
                                    <Ionicons name="search" size={16} color={Colors.gray[400]} style={styles.searchIcon} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Type or select your village name..."
                                        value={deliveryZoneSearch}
                                        onFocus={() => setIsZoneDropdownOpen(true)}
                                        onChangeText={(text) => {
                                            setDeliveryZoneSearch(text);
                                            setSelectedZone(text);
                                            setIsZoneDropdownOpen(true);
                                        }}
                                    />
                                    {Boolean(deliveryZoneSearch) && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setDeliveryZoneSearch('');
                                                setSelectedZone('');
                                                setIsZoneDropdownOpen(true);
                                            }}
                                            style={styles.clearSearchBtn}
                                        >
                                            <Ionicons name="close-circle" size={16} color={Colors.gray[400]} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Dropdown Suggestion List */}
                                {isZoneDropdownOpen && (
                                    <View style={styles.zoneDropdownList}>
                                        <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                                            {filteredZones.length > 0 ? (
                                                filteredZones.map((zone) => {
                                                    const isSelected = selectedZone === zone.key || selectedZone === zone.label;
                                                    return (
                                                        <TouchableOpacity
                                                            key={zone.key}
                                                            style={[styles.zoneDropdownItem, isSelected && styles.zoneDropdownItemActive]}
                                                            onPress={() => {
                                                                Haptics.selectionAsync();
                                                                setSelectedZone(zone.label);
                                                                setDeliveryZoneSearch(zone.label);
                                                                setIsZoneDropdownOpen(false);
                                                            }}
                                                        >
                                                            <Ionicons
                                                                name="location-sharp"
                                                                size={14}
                                                                color={isSelected ? Colors.brand.crimson : Colors.gray[400]}
                                                            />
                                                            <Text style={[styles.zoneDropdownText, isSelected && styles.zoneDropdownTextActive]}>
                                                                {zone.label}
                                                            </Text>
                                                            {isSelected && <Ionicons name="checkmark" size={14} color={Colors.brand.crimson} />}
                                                        </TouchableOpacity>
                                                    );
                                                })
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.zoneDropdownItem}
                                                    onPress={() => setIsZoneDropdownOpen(false)}
                                                >
                                                    <Text style={styles.customZoneNotice}>
                                                        Using typed village: "{deliveryZoneSearch}"
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </ScrollView>
                                    </View>
                                )}
                                <Text style={styles.fieldTip}>💡 Tap to select from list or type your village directly.</Text>
                            </View>

                            {/* Detailed Street & Landmark Address Textarea */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Street Name & Famous Landmark *</Text>
                                <TextInput
                                    style={[styles.input, styles.textarea]}
                                    placeholder="e.g. Door No. 12/4, Opposite Perumal Kovil, Yellow house"
                                    value={address}
                                    onChangeText={setAddress}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                                <Text style={styles.fieldTip}>
                                    💡 Mention street, house number, and nearby landmark (Kovil, Bus Stop, School) so our delivery boy reaches easily.
                                </Text>
                            </View>
                        </View>
                    )}
                </Card>

                {/* 3. Delivery Time Slot Picker */}
                {deliveryType === DeliveryType.DELIVERY && (
                    <Card style={styles.cardSection}>
                        <SlotPicker
                            selectedKey={selectedSlotKey}
                            onSelect={(key, label) => {
                                setSelectedSlotKey(key);
                                setSelectedSlotLabel(label);
                            }}
                        />
                    </Card>
                )}

                {/* 4. Swiggy Itemized Cart Accordion */}
                <Card style={styles.cardSection}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.cartAccordionHeader}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setIsCartExpanded(!isCartExpanded);
                        }}
                    >
                        <View style={styles.cardHeaderRow}>
                            <Ionicons name="basket" size={18} color={Colors.brand.crimson} />
                            <Text style={styles.cardTitle}>Items in Cart ({items.length})</Text>
                        </View>
                        <Ionicons
                            name={isCartExpanded ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={Colors.gray[500]}
                        />
                    </TouchableOpacity>

                    {isCartExpanded && (
                        <View style={styles.cartItemsList}>
                            {items.map((item) => {
                                const isPiece = item.unit === 'piece';
                                const qtyText = isPiece ? `${item.pieces} pcs` : `${item.kg} kg`;
                                const lineTotal = isPiece
                                    ? (item.pieces ?? 0) * (item.pricePerPiece ?? 0)
                                    : (item.kg ?? 0) * (item.pricePerKg ?? 0);

                                return (
                                    <View key={item.meatTypeId} style={styles.cartItemRow}>
                                        <Image
                                            source={getProductImageSource(item.imageURL, item.meatName)}
                                            style={styles.itemThumbnail}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.itemInfoCol}>
                                            <Text style={styles.itemName} numberOfLines={1}>
                                                {item.meatName}
                                            </Text>
                                            <Text style={styles.itemQtyText}>
                                                Qty: <Text style={styles.itemQtyBold}>{qtyText}</Text>
                                                {Boolean(item.cuttingPreference) && ` • ${item.cuttingPreference}`}
                                            </Text>
                                        </View>
                                        <Text style={styles.itemPriceText}>{formatCurrency(lineTotal)}</Text>
                                    </View>
                                );
                            })}

                            <TouchableOpacity
                                style={styles.addMoreBtn}
                                onPress={() => router.push('/(tabs)/menu')}
                            >
                                <Ionicons name="add-circle-outline" size={16} color={Colors.brand.crimson} />
                                <Text style={styles.addMoreBtnText}>Add More Items</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card>

                {/* 5. Payment Options & Monospace UPI Copy */}
                <Card style={styles.cardSection}>
                    <View style={styles.cardHeaderRow}>
                        <Ionicons name="card" size={18} color={Colors.brand.crimson} />
                        <Text style={styles.cardTitle}>Select Payment Method</Text>
                    </View>

                    <View style={styles.paymentGrid}>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.paymentCard, paymentMethod === 'upi' && styles.paymentCardActive]}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setPaymentMethod('upi');
                            }}
                        >
                            <FontAwesome5
                                name="mobile-alt"
                                size={20}
                                color={paymentMethod === 'upi' ? Colors.brand.crimson : Colors.gray[500]}
                            />
                            <View style={styles.paymentTextGroup}>
                                <Text style={styles.paymentTitle}>Pay via UPI</Text>
                                <Text style={styles.paymentSubtext}>GPay / PhonePe / Paytm</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[styles.paymentCard, paymentMethod === 'cod' && styles.paymentCardActive]}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setPaymentMethod('cod');
                            }}
                        >
                            <Ionicons
                                name="cash"
                                size={22}
                                color={paymentMethod === 'cod' ? Colors.brand.crimson : Colors.gray[500]}
                            />
                            <View style={styles.paymentTextGroup}>
                                <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                                <Text style={styles.paymentSubtext}>Pay cash at delivery</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {paymentMethod === 'upi' && (
                        <View style={styles.upiInfoBox}>
                            <View style={styles.upiIdRow}>
                                <Text style={styles.upiIdLabel}>Shop UPI ID:</Text>
                                <Text style={styles.upiIdCode}>{SHOP_CONFIG.upiId}</Text>
                            </View>
                            <TouchableOpacity style={styles.copyUpiBtn} onPress={handleCopyUpi}>
                                <Ionicons
                                    name={copiedUpi ? 'checkmark-circle' : 'copy-outline'}
                                    size={14}
                                    color={Colors.success}
                                />
                                <Text style={styles.copyUpiText}>
                                    {copiedUpi ? 'UPI ID Copied to Clipboard!' : 'Copy UPI ID to clipboard'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card>

                {/* 6. Zomato Bill Details Card */}
                <Card style={[styles.cardSection, { marginBottom: Spacing.xl }]}>
                    <Text style={styles.cardTitle}>Bill Details</Text>

                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total (Subtotal)</Text>
                        <Text style={styles.billValue}>{formatCurrency(subtotal)}</Text>
                    </View>

                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Delivery Fee</Text>
                        <Text style={[styles.billValue, deliveryCharge === 0 && styles.freeDeliveryText]}>
                            {deliveryCharge === 0 ? 'FREE' : formatCurrency(deliveryCharge)}
                        </Text>
                    </View>

                    {!isMinOrderMet && (
                        <View style={styles.minOrderWarningBox}>
                            <Ionicons name="warning-outline" size={16} color={Colors.warning} />
                            <Text style={styles.minOrderWarningText}>
                                Minimum order is {formatCurrency(SHOP_CONFIG.minimumOrderAmount)}. Add {formatCurrency(minOrderDiff)} more items.
                            </Text>
                        </View>
                    )}

                    <View style={styles.billDivider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.grandTotalLabel}>To Pay</Text>
                        <Text style={styles.grandTotalValue}>{formatCurrency(totalAmount)}</Text>
                    </View>
                </Card>
            </ScrollView>

            {/* 7. Sticky Swiggy/Zomato Bottom Action Bar */}
            <View style={styles.stickyBottomBar}>
                <View style={styles.bottomBarInfo}>
                    <Text style={styles.bottomBarTotalLabel}>TOTAL AMOUNT</Text>
                    <Text style={styles.bottomBarTotalValue}>{formatCurrency(totalAmount)}</Text>
                </View>

                <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                        styles.placeOrderBtn,
                        (!isMinOrderMet || isSubmitting) && styles.placeOrderBtnDisabled,
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={!isMinOrderMet || isSubmitting}
                >
                    {isSubmitting ? (
                        <Text style={styles.placeOrderBtnText}>Placing Order...</Text>
                    ) : (
                        <>
                            <Text style={styles.placeOrderBtnText}>
                                {paymentMethod === 'upi' ? 'PAY & PLACE ORDER' : 'PLACE ORDER'}
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        padding: Spacing.md,
        gap: Spacing.md,
    },

    // Header Banner
    headerBanner: {
        marginBottom: Spacing.xs,
    },
    headerTitle: {
        fontSize: FontSize['2xl'],
        fontWeight: FontWeight.extrabold,
        fontFamily: FontFamily.extrabold,
        color: Colors.brand.navy,
    },
    headerSubtitle: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        fontFamily: FontFamily.semibold,
        color: Colors.gray[500],
        marginTop: 2,
    },

    // Card Container
    cardSection: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        gap: Spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    cardTitle: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: Colors.brand.navy,
    },

    // Autofill Pill
    autofillBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E6F4EA',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: '#CEEAD6',
        marginBottom: Spacing.xs,
    },
    autofillTextGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    autofillBadgeText: {
        fontSize: 11,
        fontWeight: FontWeight.semibold,
        color: '#137333',
    },
    clearBtnText: {
        fontSize: 11,
        fontWeight: FontWeight.bold,
        color: Colors.brand.crimson,
        textDecorationLine: 'underline',
    },

    // Inputs
    inputGroup: {
        gap: 4,
    },
    inputLabel: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        color: Colors.gray[700],
    },
    input: {
        borderWidth: 1.5,
        borderColor: Colors.gray[200],
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        fontSize: FontSize.sm,
        color: Colors.brand.navy,
        backgroundColor: Colors.gray[50],
    },
    textarea: {
        height: 72,
    },
    mobileInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.gray[200],
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray[50],
        overflow: 'hidden',
    },
    countryCodeBadge: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        backgroundColor: Colors.gray[200],
    },
    countryCodeText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.gray[700],
    },
    mobileInput: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: Colors.transparent,
    },
    fieldTip: {
        fontSize: 11,
        color: Colors.gray[500],
        marginTop: 2,
    },

    // Delivery Type Toggles
    toggleRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray[50],
        borderWidth: 1.5,
        borderColor: Colors.gray[200],
        gap: Spacing.xs,
    },
    toggleBtnActive: {
        borderColor: Colors.brand.crimson,
        backgroundColor: '#FFF0F0',
    },
    toggleText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.gray[700],
    },
    toggleTextActive: {
        color: Colors.brand.crimson,
    },
    toggleSubtext: {
        fontSize: 10,
        fontWeight: FontWeight.semibold,
        color: Colors.success,
        marginTop: 1,
    },

    // Searchable Area Selector
    addressFormSpace: {
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },
    searchBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.gray[200],
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray[50],
        paddingHorizontal: Spacing.sm,
    },
    searchIcon: {
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        paddingVertical: Spacing.sm,
        fontSize: FontSize.xs,
        color: Colors.brand.navy,
    },
    clearSearchBtn: {
        padding: 4,
    },
    zoneDropdownList: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        borderRadius: BorderRadius.md,
        marginTop: 4,
        maxHeight: 160,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    zoneDropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
        gap: Spacing.xs,
    },
    zoneDropdownItemActive: {
        backgroundColor: '#FFF0F0',
    },
    zoneDropdownText: {
        flex: 1,
        fontSize: FontSize.xs,
        color: Colors.gray[700],
    },
    zoneDropdownTextActive: {
        fontWeight: FontWeight.bold,
        color: Colors.brand.crimson,
    },
    customZoneNotice: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
        fontStyle: 'italic',
    },

    // Slot Picker
    emptySlotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: Spacing.sm,
        backgroundColor: '#FEF3C7',
        borderRadius: BorderRadius.md,
    },
    noSlotsText: {
        fontSize: FontSize.xs,
        color: '#92400E',
        fontWeight: FontWeight.medium,
    },
    slotContainer: {
        gap: Spacing.xs,
    },
    slotHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    slotHeaderLabel: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.brand.navy,
    },
    tomorrowBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
    },
    tomorrowBadgeText: {
        fontSize: 9,
        fontWeight: FontWeight.bold,
        color: '#0369A1',
    },
    slotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.xs,
    },
    slotChip: {
        paddingVertical: 8,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray[50],
        borderWidth: 1.5,
        borderColor: Colors.gray[200],
        alignItems: 'center',
    },
    slotChipActive: {
        borderColor: Colors.brand.crimson,
        backgroundColor: '#FFF0F0',
    },
    slotChipFull: {
        opacity: 0.4,
    },
    slotChipText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        color: Colors.gray[700],
    },
    slotChipTextActive: {
        color: Colors.brand.crimson,
        fontWeight: FontWeight.bold,
    },
    slotFullText: {
        fontSize: 9,
        color: Colors.error,
        fontWeight: FontWeight.bold,
        marginTop: 2,
    },

    // Cart Accordion
    cartAccordionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cartItemsList: {
        gap: Spacing.xs,
        paddingTop: Spacing.xs,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[100],
    },
    cartItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: 4,
    },
    itemThumbnail: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray[100],
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    itemThumbnailPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfoCol: {
        flex: 1,
    },
    itemName: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.brand.navy,
    },
    itemQtyText: {
        fontSize: 11,
        color: Colors.gray[500],
    },
    itemQtyBold: {
        fontWeight: FontWeight.bold,
        color: Colors.brand.navy,
    },
    itemPriceText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.brand.navy,
    },
    addMoreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: Spacing.xs,
        marginTop: 4,
    },
    addMoreBtnText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.brand.crimson,
    },

    // Payment Grid
    paymentGrid: {
        gap: Spacing.xs,
    },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.gray[50],
        borderWidth: 1.5,
        borderColor: Colors.gray[200],
        gap: Spacing.md,
    },
    paymentCardActive: {
        borderColor: Colors.brand.crimson,
        backgroundColor: '#FFF0F0',
    },
    paymentTextGroup: {
        flex: 1,
    },
    paymentTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.brand.navy,
    },
    paymentSubtext: {
        fontSize: 11,
        color: Colors.gray[500],
        marginTop: 1,
    },
    upiInfoBox: {
        backgroundColor: '#E6F4EA',
        borderWidth: 1,
        borderColor: '#CEEAD6',
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        gap: 6,
        marginTop: Spacing.xs,
    },
    upiIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    upiIdLabel: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: '#137333',
    },
    upiIdCode: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        fontFamily: 'monospace',
        backgroundColor: Colors.white,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        color: '#137333',
    },
    copyUpiBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    copyUpiText: {
        fontSize: 11,
        fontWeight: FontWeight.bold,
        color: '#137333',
    },

    // Bill Details
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    billLabel: {
        fontSize: FontSize.xs,
        color: Colors.gray[600],
    },
    billValue: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        color: Colors.brand.navy,
    },
    freeDeliveryText: {
        color: Colors.success,
        fontWeight: FontWeight.bold,
    },
    minOrderWarningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        padding: Spacing.xs,
        backgroundColor: '#FEF3C7',
        borderRadius: BorderRadius.sm,
        marginTop: 4,
    },
    minOrderWarningText: {
        fontSize: 11,
        color: '#92400E',
        fontWeight: FontWeight.medium,
        flex: 1,
    },
    billDivider: {
        height: 1,
        backgroundColor: Colors.gray[200],
        marginVertical: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    grandTotalLabel: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.extrabold,
        color: Colors.brand.navy,
    },
    grandTotalValue: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.extrabold,
        fontFamily: FontFamily.extrabold,
        color: Colors.brand.crimson,
    },

    // Sticky Bottom Bar
    stickyBottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bottomBarInfo: {
        gap: 1,
    },
    bottomBarTotalLabel: {
        fontSize: 9,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: Colors.gray[400],
        letterSpacing: 0.5,
    },
    bottomBarTotalValue: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.extrabold,
        fontFamily: FontFamily.extrabold,
        color: Colors.brand.navy,
    },
    placeOrderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.brand.crimson,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 4,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
        shadowColor: Colors.brand.crimson,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    placeOrderBtnDisabled: {
        backgroundColor: Colors.gray[400],
        shadowOpacity: 0,
        elevation: 0,
    },
    placeOrderBtnText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.extrabold,
        fontFamily: FontFamily.extrabold,
        color: Colors.white,
        letterSpacing: 0.5,
    },
});