import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useProducts, groupChickenProducts } from '../../hooks/useProducts';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '@bismi/core';
import type { MeatType } from '@bismi/core';
import { Colors, FontSize, FontWeight, FontFamily, Spacing, BorderRadius, Shadows } from '../../constants/Colors';
import { getProductImageSource } from '../../utils/imageResolver';
import { InlineStepper } from '../../components/ui/InlineStepper';

// Filter Chip Definitions
const FILTER_CHIPS = [
    { key: 'ALL', label: 'All Cuts', category: 'chicken' },
    { key: 'Everyday Cuts', label: 'Everyday Cuts', category: 'chicken' },
    { key: 'Special Cuts', label: 'Special Cuts', category: 'chicken' },
    { key: 'Country & Whole', label: 'Country / Naatu Kozhi', category: 'chicken' },
    { key: 'kadai', label: 'Kaadai (Quail)', category: 'kadai' },
];

// ─── Streamlined Product Card ──────────────────────────────
function ProductCard({ product }: { product: MeatType }) {
    const priceText = product.unit === 'piece'
        ? `₹${product.pricePerPiece ?? 0}/pc`
        : `₹${product.pricePerKg}/kg`;

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
                    <Text style={styles.cardName} numberOfLines={1}>{product.name}</Text>
                    {Boolean(product.localName) && (
                        <Text style={styles.cardLocal} numberOfLines={1}>{product.localName}</Text>
                    )}
                    <Text style={styles.cardDesc} numberOfLines={2}>{product.description}</Text>
                </View>

                <View style={styles.cardBottom}>
                    <Text style={styles.cardPrice}>{priceText}</Text>
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

// ─── Modern 2-Layer Menu Screen ────────────────────────────
export default function MenuScreen() {
    const params = useLocalSearchParams<{ category?: string }>();
    const [selectedFilter, setSelectedFilter] = useState<string>(
        params.category === 'kadai' ? 'kadai' : 'ALL'
    );
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch chicken & kaadai products
    const activeCategory = selectedFilter === 'kadai' ? 'kadai' : 'chicken';
    const { products, loading } = useProducts(activeCategory);

    // Sync route param changes
    useEffect(() => {
        if (params.category === 'kadai') {
            setSelectedFilter('kadai');
        } else if (params.category === 'chicken' && selectedFilter === 'kadai') {
            setSelectedFilter('ALL');
        }
    }, [params.category]);

    // Real-time search filtering
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        const q = searchQuery.toLowerCase().trim();
        return products.filter((p) =>
            p.name.toLowerCase().includes(q) ||
            (p.localName && p.localName.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q))
        );
    }, [products, searchQuery]);

    // Grouping into sections
    const sections = useMemo(() => {
        if (activeCategory === 'kadai') {
            return [{ title: 'Kaadai (Farm Quail)', data: filteredProducts }];
        }

        const groups = groupChickenProducts(filteredProducts);
        if (selectedFilter === 'ALL') {
            return groups
                .map((g) => ({ title: g.groupLabel, data: g.products }))
                .filter((g) => g.data.length > 0);
        }

        return groups
            .filter((g) => g.groupLabel.toLowerCase() === selectedFilter.toLowerCase())
            .map((g) => ({ title: g.groupLabel, data: g.products }));
    }, [activeCategory, filteredProducts, selectedFilter]);

    const handleFilterSelect = (key: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedFilter(key);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            {/* ─── Layer 1: Clean Search Bar ─── */}
            <View style={styles.searchHeader}>
                <View style={styles.searchInputWrapper}>
                    <Ionicons name="search-outline" size={17} color={Colors.gray[400]} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Search cuts (e.g. Biryani Cut, Boneless, Quail...)'
                        placeholderTextColor={Colors.gray[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={17} color={Colors.gray[400]} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ─── Layer 2: Unified 1-Tap Category & Sub-Cut Filter Bar ─── */}
            <View style={styles.filterBarContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterBarContent}
                >
                    {FILTER_CHIPS.map((chip) => {
                        const isSelected = selectedFilter === chip.key;
                        return (
                            <TouchableOpacity
                                key={chip.key}
                                style={[styles.chipPill, isSelected && styles.chipPillActive]}
                                onPress={() => handleFilterSelect(chip.key)}
                                activeOpacity={0.75}
                            >
                                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                    {chip.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ─── Products List (Starts Immediately Without Header Clutter) ─── */}
            {loading ? (
                <LoadingSpinner label="Loading fresh cuts..." fullScreen />
            ) : sections.length === 0 || sections.every(s => s.data.length === 0) ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={38} color={Colors.gray[300]} />
                    <Text style={styles.emptyTitle}>No cuts found</Text>
                    <Text style={styles.emptySub}>Try searching for another cut or select "All Cuts".</Text>
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <ProductCard product={item} />}
                    renderSectionHeader={({ section }) => (
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <Text style={styles.sectionCount}>
                                {section.data.length} cut{section.data.length !== 1 ? 's' : ''}
                            </Text>
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
    safeArea: { flex: 1, backgroundColor: '#FAF7F2' },

    // Layer 1: Search Header
    searchHeader: {
        backgroundColor: Colors.white,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xs + 2,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: BorderRadius.md,
        paddingHorizontal: 12,
        height: 38,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: FontSize.xs + 1,
        fontFamily: FontFamily.medium,
        color: Colors.brand.navy,
        paddingVertical: 0,
    },

    // Layer 2: Unified Filter Bar
    filterBarContainer: {
        backgroundColor: Colors.white,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    filterBarContent: {
        paddingHorizontal: Spacing.md,
        gap: 8,
    },
    chipPill: {
        paddingHorizontal: 13,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipPillActive: {
        backgroundColor: Colors.brand.crimson,
        borderColor: Colors.brand.crimson,
        ...Shadows.sm,
    },
    chipText: {
        fontSize: 11.5,
        fontWeight: FontWeight.semibold,
        fontFamily: FontFamily.semibold,
        color: Colors.gray[600],
    },
    chipTextActive: {
        color: Colors.white,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
    },

    // Section Header
    sectionHeader: {
        backgroundColor: '#FAF7F2',
        paddingHorizontal: Spacing.md,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#F3EFEA',
    },
    sectionTitle: {
        fontSize: FontSize.sm + 1,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: Colors.brand.navy,
    },
    sectionCount: {
        fontSize: 11,
        color: Colors.gray[500],
        fontFamily: FontFamily.regular,
    },

    listContent: {
        paddingBottom: 85,
    },

    // Clean Product Card
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        marginHorizontal: Spacing.md,
        marginTop: 10,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
        ...Shadows.sm,
    },
    cardImageWrapper: {
        position: 'relative',
    },
    cardImage: {
        width: 108,
        height: 108,
    },
    portionBadge: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        borderRadius: BorderRadius.sm,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    portionBadgeText: {
        color: Colors.white,
        fontSize: 8.5,
        fontWeight: FontWeight.semibold,
        fontFamily: FontFamily.semibold,
    },
    cardBody: {
        flex: 1,
        padding: 10,
        justifyContent: 'space-between',
    },
    cardTop: {
        flex: 1,
    },
    cardName: {
        fontSize: FontSize.sm + 1,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: Colors.brand.navy,
    },
    cardLocal: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
        fontFamily: FontFamily.regular,
        marginTop: 1,
    },
    cardDesc: {
        fontSize: 10.5,
        color: Colors.gray[500],
        fontFamily: FontFamily.regular,
        marginTop: 3,
        lineHeight: 14,
    },
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    cardPrice: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.extrabold,
        fontFamily: FontFamily.extrabold,
        color: Colors.brand.crimson,
    },

    // Empty state
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: Spacing.lg,
    },
    emptyTitle: {
        fontSize: FontSize.base,
        fontWeight: FontWeight.bold,
        color: Colors.brand.navy,
        marginTop: 12,
    },
    emptySub: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
        textAlign: 'center',
        marginTop: 4,
    },
});
