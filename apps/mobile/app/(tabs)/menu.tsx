import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    Image,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useProducts, groupChickenProducts } from '../../hooks/useProducts';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '@bismi/core';
import type { MeatType } from '@bismi/core';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../constants/Colors';

const CATEGORIES = ['chicken', 'kadai'] as const;
type CategoryId = typeof CATEGORIES[number];

const CATEGORY_LABELS: Record<CategoryId, string> = {
    chicken: '🐔 Chicken',
    kadai: '🐦 Kaadai',
};

import { getProductImageSource } from '../../utils/imageResolver';

import { InlineStepper } from '../../components/ui/InlineStepper';

// ─── Product Card ─────────────────────────────────────────
function ProductCard({ product }: { product: MeatType }) {
    const price = product.unit === 'piece'
        ? `${formatCurrency(product.pricePerPiece ?? 0)}/pc`
        : `${formatCurrency(product.pricePerKg)}/kg`;
    const portionBadge = product.unit === 'piece' ? 'Per Piece' : 'Cleaned & Cut';

    return (
        <TouchableOpacity
            activeOpacity={0.88}
            style={styles.card}
            onPress={() => router.push(`/product/${product.id}`)}
        >
            <View style={styles.cardImageWrapper}>
                <Image
                    source={getProductImageSource(product.imageURL)}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.portionBadge}>
                    <Text style={styles.portionBadgeText}>{portionBadge}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardName} numberOfLines={1}>{product.name}</Text>
                        {product.localName && (
                            <Text style={styles.cardLocal} numberOfLines={1}>{product.localName}</Text>
                        )}
                        <Text style={styles.cardDesc} numberOfLines={2}>{product.description}</Text>
                    </View>
                </View>
                <View style={styles.cardBottom}>
                    <Text style={styles.cardPrice}>{price}</Text>
                    {product.isAvailableToday === false ? (
                        <Badge label="Not Today" variant="error" size="sm" />
                    ) : (
                        <InlineStepper product={product} />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── Menu Screen ──────────────────────────────────────────
export default function MenuScreen() {
    const params = useLocalSearchParams<{ category?: string }>();
    const [activeCategory, setActiveCategory] = useState<CategoryId>(
        (params.category as CategoryId) ?? 'chicken'
    );

    const { products, loading } = useProducts(activeCategory);

    const sections = activeCategory === 'chicken'
        ? groupChickenProducts(products).map((g) => ({ title: g.groupLabel, data: g.products }))
        : [{ title: 'Kaadai', data: products }];

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* Category Tabs */}
            <View style={styles.tabs}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[styles.tab, activeCategory === cat && styles.tabActive]}
                        onPress={() => setActiveCategory(cat)}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeCategory === cat && styles.tabTextActive]}>
                            {CATEGORY_LABELS[cat]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <LoadingSpinner label="Loading products..." fullScreen />
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ProductCard product={item} />}
                    renderSectionHeader={({ section }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        </View>
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    stickySectionHeadersEnabled
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Colors.brand.cream },

    // Tabs
    tabs: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
        ...Shadows.sm,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.sm,
        alignItems: 'center',
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.gray[100],
    },
    tabActive: { backgroundColor: Colors.brand.crimson },
    tabText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.gray[600] },
    tabTextActive: { color: Colors.white },

    // Section header
    sectionHeader: {
        backgroundColor: Colors.brand.cream,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
    },
    sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.brand.navy },

    listContent: { paddingBottom: 32 },

    // Card
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.md,
        marginTop: Spacing.md,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        ...Shadows.sm,
    },
    cardImageWrapper: { position: 'relative' },
    cardImage: { width: 110, height: 110 },
    portionBadge: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        borderRadius: BorderRadius.sm,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    portionBadgeText: { color: Colors.white, fontSize: 8, fontWeight: FontWeight.semibold },
    cardBody: { flex: 1, padding: Spacing.sm, justifyContent: 'space-between' },
    cardTop: { flex: 1 },
    cardName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.brand.navy },
    cardLocal: { fontSize: FontSize.xs, color: Colors.gray[500], marginTop: 2 },
    cardDesc: { fontSize: FontSize.xs, color: Colors.gray[500], marginTop: 4, lineHeight: 16 },
    cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    cardPrice: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand.crimson },
    addBtn: {
        backgroundColor: Colors.brand.crimson,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
    },
    addBtnText: { color: Colors.white, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
});
