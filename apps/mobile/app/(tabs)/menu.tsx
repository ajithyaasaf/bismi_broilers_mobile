import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
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

// ─── 2-Column Grid Product Card ───────────────────────────
function ProductGridCard({ product }: { product: MeatType }) {
    const isAvailable = product.isAvailableToday !== false;
    const priceText = product.unit === 'piece'
        ? `₹${product.pricePerPiece ?? 0}/pc`
        : `₹${product.pricePerKg}/kg`;

    const portionBadge = product.unit === 'piece' ? 'Per Piece' : 'Cleaned & Cut';

    return (
        <TouchableOpacity
            activeOpacity={0.88}
            style={[styles.gridCard, !isAvailable && styles.gridCardDisabled]}
            onPress={() => router.push(`/product/${product.id}`)}
        >
            {/* Top Image Container with Cut Badge */}
            <View style={styles.cardImageWrapper}>
                <Image
                    source={getProductImageSource(product.imageURL)}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.portionBadge}>
                    <Text style={styles.portionBadgeText}>{portionBadge}</Text>
                </View>
                {!isAvailable && (
                    <View style={styles.unavailableOverlay}>
                        <Text style={styles.unavailableOverlayText}>Unavailable</Text>
                    </View>
                )}
            </View>

            {/* Card Content (Consistent heights across columns) */}
            <View style={styles.cardBody}>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={1}>
                        {product.name}
                    </Text>
                    <Text style={styles.cardLocal} numberOfLines={1}>
                        {product.localName || 'Fresh Halal Cut'}
                    </Text>
                    <Text style={styles.cardPrice}>
                        {priceText}
                    </Text>
                </View>

                {/* Bottom Action: Full-Width Stepper (Never squeezes price, 100% elder-friendly) */}
                <View style={styles.cardBottom}>
                    {!isAvailable ? (
                        <Badge label="Sold Out" variant="error" size="sm" />
                    ) : (
                        <InlineStepper product={product} fullWidth compact />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ─── Modern 2-Column Menu Screen ───────────────────────────
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

    // Grouping into sections for 2-column grid
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

            {/* ─── Layer 2: Unified 1-Tap Filter Bar ─── */}
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

            {/* ─── 2-Column Grid Product Sections ─── */}
            {loading ? (
                <LoadingSpinner label="Loading fresh cuts..." fullScreen />
            ) : sections.length === 0 || sections.every(s => s.data.length === 0) ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={38} color={Colors.gray[300]} />
                    <Text style={styles.emptyTitle}>No cuts found</Text>
                    <Text style={styles.emptySub}>Try searching for another cut or select "All Cuts".</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {sections.map((section) => (
                        <View key={section.title} style={styles.sectionContainer}>
                            {/* Section Title Header */}
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <Text style={styles.sectionCount}>
                                    {section.data.length} cut{section.data.length !== 1 ? 's' : ''}
                                </Text>
                            </View>

                            {/* 2-Column Grid Cards */}
                            <View style={styles.gridRow}>
                                {section.data.map((product) => (
                                    <ProductGridCard key={product.id} product={product} />
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>
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

    // Scroll & Section Container
    scrollContent: {
        paddingHorizontal: Spacing.md,
        paddingTop: 6,
        paddingBottom: 95,
    },
    sectionContainer: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        marginBottom: 8,
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

    // 2-Column Grid Layout
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 12,
    },
    gridCard: {
        width: '48.5%',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg, // 14px
        borderWidth: 1,
        borderColor: '#F1F5F9',
        overflow: 'hidden',
        ...Shadows.sm,
    },
    gridCardDisabled: {
        opacity: 0.72,
    },
    cardImageWrapper: {
        width: '100%',
        height: 118,
        position: 'relative',
        backgroundColor: '#F8FAFC',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    portionBadge: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        backgroundColor: 'rgba(15, 23, 42, 0.82)',
        borderRadius: 4,
        paddingHorizontal: 5,
        paddingVertical: 2,
    },
    portionBadgeText: {
        color: Colors.white,
        fontSize: 8,
        fontWeight: FontWeight.semibold,
        fontFamily: FontFamily.semibold,
    },
    unavailableOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unavailableOverlayText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    cardBody: {
        padding: 9,
        justifyContent: 'space-between',
        flex: 1,
    },
    cardInfo: {
        marginBottom: 6,
    },
    cardName: {
        fontSize: 12.5,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: Colors.brand.navy,
        lineHeight: 16,
    },
    cardLocal: {
        fontSize: 10,
        color: Colors.gray[500],
        fontFamily: FontFamily.regular,
        marginTop: 2,
    },
    cardBottom: {
        marginTop: 8,
        width: '100%',
        alignItems: 'center',
    },
    cardPrice: {
        fontSize: 14,
        fontWeight: FontWeight.extrabold,
        fontFamily: FontFamily.extrabold,
        color: Colors.brand.crimson,
        marginTop: 4,
    },

    // Empty State
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
