import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ImageSourcePropType,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useBestSellers, useTodayAvailable } from '../../hooks/useProducts';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SHOP_CONFIG, CATEGORIES, formatCurrency } from '@bismi/core';
import type { MeatType } from '@bismi/core';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Local category image assets copied from web
const CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
    chicken: require('../../assets/images/Category images/chicken.avif'),
    kadai: require('../../assets/images/Category images/quail.png'),
};

const SCOOTER_IMAGE = require('../../assets/images/why-choose-us/delivery_guy_scooter.png');

// ─── Today Available Strip ────────────────────────────────
function TodayAvailableStrip() {
    const { products, loading } = useTodayAvailable();
    if (loading || products.length === 0) return null;

    return (
        <View style={styles.todayStrip}>
            <View style={styles.todayStripHeader}>
                <Ionicons name="checkmark-circle" size={16} color="#065f46" />
                <Text style={styles.todayStripLabel}>Fresh Cut Today</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.md }}>
                {products.map((p) => (
                    <View key={p.id} style={styles.todayChip}>
                        <Text style={styles.todayChipText}>{p.name}</Text>
                        {Boolean(p.todayLabel) && (
                            <Text style={styles.todayChipSub}>{p.todayLabel}</Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

import { getProductImageSource } from '../../utils/imageResolver';

import { InlineStepper } from '../../components/ui/InlineStepper';
import { SwiggyAnimatedHero } from '../../components/SwiggyAnimatedHero';
import { MyntraStickyHeader, MyntraCategoryStories } from '../../components/MyntraTopHeader';

// ─── Best Seller Card ─────────────────────────────────────
function BestSellerCard({ product }: { product: MeatType }) {
    const portionBadge = product.unit === 'piece' ? 'Per Piece' : 'Cleaned & Cut';

    return (
        <TouchableOpacity
            activeOpacity={0.88}
            style={styles.bestSellerCard}
            onPress={() => router.push(`/product/${product.id}`)}
        >
            <View style={styles.imageWrapper}>
                <Image
                    source={getProductImageSource(product.imageURL)}
                    style={styles.bestSellerImage}
                    resizeMode="cover"
                />
                <View style={styles.portionBadge}>
                    <Text style={styles.portionBadgeText}>{portionBadge}</Text>
                </View>
            </View>

            <View style={styles.bestSellerInfo}>
                <View>
                    <Text style={styles.bestSellerName} numberOfLines={1}>{product.name}</Text>
                    {product.localName && (
                        <Text style={styles.bestSellerLocal} numberOfLines={1}>{product.localName}</Text>
                    )}
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.bestSellerPrice}>
                        {product.unit === 'piece'
                            ? `${formatCurrency(product.pricePerPiece ?? 0)}/pc`
                            : `${formatCurrency(product.pricePerKg)}/kg`}
                    </Text>
                    <InlineStepper product={product} compact />
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── Category Card ────────────────────────────────────────
function CategoryCard({ id, name, description }: { id: string; name: string; description: string }) {
    const source = CATEGORY_IMAGES[id];

    return (
        <TouchableOpacity
            activeOpacity={0.88}
            style={styles.categoryCard}
            onPress={() => router.push({ pathname: '/(tabs)/menu', params: { category: id } })}
        >
            {source ? (
                <Image source={source} style={styles.categoryImage} resizeMode="contain" />
            ) : (
                <MaterialCommunityIcons name="food-turkey" size={40} color={Colors.brand.crimson} />
            )}
            <Text style={styles.categoryName}>{name}</Text>
            <Text style={styles.categoryDesc} numberOfLines={2}>{description}</Text>
        </TouchableOpacity>
    );
}

// ─── Home Screen ─────────────────────────────────────────
export default function HomeScreen() {
    const { products: bestSellers, loading: bsLoading } = useBestSellers();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            {/* ─── Pinned Sticky Header (Location + Search + Bell/Heart/Cart) ─── */}
            <MyntraStickyHeader />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ─── Scrollable Category Tabs & Story Avatars ─── */}
                <MyntraCategoryStories />
                {/* ─── Swiggy / Zomato Dynamic Animated Hero Carousel ─── */}
                <SwiggyAnimatedHero />

                {/* Today Available Strip */}
                <TodayAvailableStrip />

                {/* Categories */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionTitle}>Shop by Category</Text>
                    </View>
                    <View style={styles.categoriesRow}>
                        {CATEGORIES.map((cat) => (
                            <CategoryCard key={cat.id} id={cat.id} name={cat.name} description={cat.description} />
                        ))}
                    </View>
                </View>

                {/* Best Sellers */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Ionicons name="star" size={18} color="#f59e0b" style={{ marginRight: 6 }} />
                        <Text style={styles.sectionTitle}>Best Sellers</Text>
                    </View>
                    {bsLoading ? (
                        <LoadingSpinner label="Loading products..." size="small" />
                    ) : (
                        <FlatList
                            data={bestSellers}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm }}
                            renderItem={({ item }) => <BestSellerCard product={item} />}
                            ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
                        />
                    )}
                </View>

                {/* Shop Info Card */}
                <View style={[styles.section, { paddingBottom: Spacing['2xl'] }]}>
                    <Card elevation="md" style={styles.infoCard}>
                        <View style={styles.infoTitleRow}>
                            <Ionicons name="location" size={20} color={Colors.brand.crimson} />
                            <Text style={styles.infoCardTitle}>Visit Our Shop</Text>
                        </View>
                        <Text style={styles.infoCardText}>{SHOP_CONFIG.address}</Text>

                        <View style={styles.infoDivider} />

                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={16} color={Colors.gray[500]} style={styles.infoIcon} />
                            <Text style={styles.infoLabel}>Hours:</Text>
                            <Text style={styles.infoValue}>{SHOP_CONFIG.workingHours}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={16} color={Colors.gray[500]} style={styles.infoIcon} />
                            <Text style={styles.infoLabel}>Days:</Text>
                            <Text style={styles.infoValue}>{SHOP_CONFIG.workingDays}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={16} color={Colors.gray[500]} style={styles.infoIcon} />
                            <Text style={styles.infoLabel}>Phone:</Text>
                            <Text style={[styles.infoValue, { color: Colors.brand.crimson, fontWeight: FontWeight.bold }]}>{SHOP_CONFIG.phone}</Text>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.brand.cream },
    scroll: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingBottom: 120 },

    // Hero
    hero: {
        backgroundColor: Colors.brand.crimson,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: BorderRadius.xl,
        borderBottomRightRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    heroContent: { flex: 1, marginRight: Spacing.xs },
    freeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        gap: 4,
    },
    freeBadgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: Colors.brand.crimson },
    heroTitle: {
        fontSize: FontSize['2xl'],
        fontWeight: FontWeight.extrabold,
        color: Colors.white,
        lineHeight: 30,
        marginVertical: Spacing.xs,
    },
    heroSubtitle: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 16,
        marginBottom: Spacing.md,
    },
    heroBtn: { alignSelf: 'flex-start' },
    scooterImage: { width: 130, height: 130 },

    // Today strip
    todayStrip: {
        backgroundColor: Colors.white,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
    },
    todayStripHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: 6, gap: 6 },
    todayStripLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#065f46' },
    todayChip: {
        backgroundColor: '#d1fae5',
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        marginRight: Spacing.sm,
    },
    todayChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: '#065f46' },
    todayChipSub: { fontSize: 9, color: '#065f46', marginTop: 1 },

    // Sections
    section: { paddingTop: Spacing.lg },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
    sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand.navy },

    // Categories
    categoriesRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        gap: Spacing.md,
    },
    categoryCard: {
        flex: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        ...Shadows.md,
    },
    categoryImage: { width: 56, height: 56, marginBottom: Spacing.xs },
    categoryName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.brand.navy },
    categoryDesc: { fontSize: FontSize.xs, color: Colors.gray[500], textAlign: 'center', marginTop: 4 },

    // Best Sellers
    bestSellerCard: {
        width: 172,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.md,
    },
    imageWrapper: { position: 'relative' },
    bestSellerImage: { width: 172, height: 125 },
    portionBadge: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        borderRadius: BorderRadius.sm,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    portionBadgeText: { color: Colors.white, fontSize: 9, fontWeight: FontWeight.semibold },
    bestSellerInfo: { padding: 10, gap: 6 },
    bestSellerName: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.brand.navy },
    bestSellerLocal: { fontSize: 10, color: Colors.gray[500], marginTop: 1 },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, gap: 4 },
    bestSellerPrice: { fontSize: FontSize.xs, fontWeight: FontWeight.extrabold, color: Colors.brand.crimson },

    // Info card
    infoCard: { marginHorizontal: Spacing.md },
    infoTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.xs },
    infoCardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand.navy },
    infoCardText: { fontSize: FontSize.xs, color: Colors.gray[600], lineHeight: 18 },
    infoDivider: { height: 1, backgroundColor: Colors.gray[100], marginVertical: Spacing.sm },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    infoIcon: { marginRight: 6 },
    infoLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.gray[500], width: 50 },
    infoValue: { fontSize: FontSize.xs, color: Colors.gray[700], flex: 1 },
});
