import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, FontFamily, Spacing, BorderRadius, Shadows } from '../constants/Colors';
import { useCart } from '../context/CartContext';

const SEARCH_PLACEHOLDERS = [
    'Chicken Curry Cut...',
    'Sunday Biryani Mutton...',
    'Kaadai (Farm Quail)...',
    'Nattu Kozhi (Country)...',
    'Fresh Boneless Breast...',
];

const TABS = [
    { id: 'all', label: 'ALL' },
    { id: 'chicken', label: 'CHICKEN' },
    { id: 'mutton', label: 'MUTTON' },
    { id: 'kadai', label: 'KAADAI' },
    { id: 'deals', label: 'OFFERS' },
];

const CATEGORY_STORIES = [
    {
        id: 'chicken',
        name: 'Chicken',
        image: require('../assets/images/Category images/chicken.avif'),
        badge: 'Fresh',
        bg: '#FEE2E2',
    },
    {
        id: 'mutton',
        name: 'Mutton',
        image: require('../assets/images/hero section images/biryani_cutout.png'),
        badge: 'Prime',
        bg: '#FEF3C7',
    },
    {
        id: 'kadai',
        name: 'Kaadai',
        image: require('../assets/images/Category images/quail.png'),
        badge: 'Farm',
        bg: '#E0E7FF',
    },
    {
        id: 'express',
        name: '45-Min',
        image: require('../assets/images/hero section images/3D Speed Delivery Rider.png'),
        badge: 'Fast',
        bg: '#DCFCE7',
    },
    {
        id: 'offers',
        name: '₹50 OFF',
        image: require('../assets/images/hero section images/coupon_cutout.png'),
        badge: 'Deal',
        bg: '#FCE7F3',
    },
];

/**
 * ─── 1. STICKY TOP HEADER (Location Bar + Search Bar + Action Icons) ───
 * Remains fixed at the top of the screen during scroll for instant access.
 */
export function MyntraStickyHeader() {
    const { itemCount } = useCart();
    const [placeholderIndex, setPlaceholderIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const interval = setInterval(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }).start();
            });
        }, 2800);

        return () => clearInterval(interval);
    }, [fadeAnim]);

    return (
        <View style={styles.stickyHeaderContainer}>
            {/* ─── Row 1: Location & Fast Delivery Pill ─── */}
            <View style={styles.locationRow}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.locationLeft}
                    onPress={() => router.push('/(tabs)/menu')}
                >
                    <View style={styles.locationPinBox}>
                        <Ionicons name="location" size={15} color={Colors.brand.crimson} />
                    </View>
                    <View>
                        <View style={styles.locationTitleRow}>
                            <Text style={styles.deliverToText}>Deliver to </Text>
                            <Text style={styles.locationBoldText}>Mudukulattur</Text>
                            <Ionicons name="chevron-down" size={13} color={Colors.gray[600]} style={{ marginLeft: 2 }} />
                        </View>
                        <Text style={styles.locationSubText} numberOfLines={1}>
                            Bus Stand, Kamuthi Rd & 20+ Villages
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.deliveryBadgePill}>
                    <Ionicons name="flash" size={12} color="#059669" />
                    <Text style={styles.deliveryBadgeText}>45 Mins</Text>
                </View>
            </View>

            {/* ─── Row 2: Search Bar + Action Icons (Bell, Heart, Cart) ─── */}
            <View style={styles.searchRow}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.searchBar}
                    onPress={() => router.push('/(tabs)/menu')}
                >
                    <Ionicons name="search" size={17} color={Colors.brand.crimson} />
                    <Animated.Text
                        style={[styles.searchPlaceholder, { opacity: fadeAnim }]}
                        numberOfLines={1}
                    >
                        &quot;{SEARCH_PLACEHOLDERS[placeholderIndex]}&quot;
                    </Animated.Text>
                    <Ionicons name="mic-outline" size={17} color={Colors.gray[400]} />
                </TouchableOpacity>

                <View style={styles.actionIconsRow}>
                    <TouchableOpacity
                        activeOpacity={0.75}
                        style={styles.iconBtn}
                        onPress={() => router.push('/(tabs)/menu')}
                    >
                        <Ionicons name="notifications-outline" size={21} color={Colors.gray[700]} />
                        <View style={styles.notifDot} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.75}
                        style={styles.iconBtn}
                        onPress={() => router.push('/(tabs)/menu')}
                    >
                        <Ionicons name="heart-outline" size={21} color={Colors.gray[700]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.75}
                        style={styles.iconBtn}
                        onPress={() => router.push('/(tabs)/cart')}
                    >
                        <Ionicons name="bag-handle-outline" size={21} color={Colors.gray[800]} />
                        {itemCount > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

/**
 * ─── 2. SCROLLABLE CATEGORY TABS & STORY BUBBLES ───
 * Placed inside ScrollView so it smoothly scrolls up and hides away.
 */
interface MyntraCategoryStoriesProps {
    selectedCategory?: string;
    onSelectCategory?: (id: string) => void;
}

export function MyntraCategoryStories({
    selectedCategory = 'all',
    onSelectCategory,
}: MyntraCategoryStoriesProps) {
    const handleTabPress = (tabId: string) => {
        Haptics.selectionAsync();
        if (onSelectCategory) {
            onSelectCategory(tabId);
        } else {
            if (tabId === 'all') {
                router.push('/(tabs)/menu');
            } else {
                router.push({ pathname: '/(tabs)/menu', params: { category: tabId } });
            }
        }
    };

    const handleStoryPress = (storyId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (storyId === 'express' || storyId === 'offers') {
            router.push('/(tabs)/menu');
        } else {
            router.push({ pathname: '/(tabs)/menu', params: { category: storyId } });
        }
    };

    return (
        <View style={styles.scrollableCategoriesContainer}>
            {/* ─── Row 3: Myntra-Style Segmented Category Tabs ─── */}
            <View style={styles.tabsRow}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsScrollContent}
                >
                    {TABS.map((tab) => {
                        const isActive = selectedCategory === tab.id;
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                activeOpacity={0.8}
                                style={[styles.tabItem, isActive && styles.tabItemActive]}
                                onPress={() => handleTabPress(tab.id)}
                            >
                                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                                    {tab.label}
                                </Text>
                                {isActive && <View style={styles.activeTabIndicator} />}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* ─── Row 4: Circular Category Story Avatars (Myntra Circular Bubbles) ─── */}
            <View style={styles.storiesContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.storiesScrollContent}
                >
                    {CATEGORY_STORIES.map((story) => {
                        const isSelected = selectedCategory === story.id;
                        return (
                            <TouchableOpacity
                                key={story.id}
                                activeOpacity={0.85}
                                style={styles.storyWrapper}
                                onPress={() => handleStoryPress(story.id)}
                            >
                                <View style={[styles.storyRing, isSelected && styles.storyRingActive]}>
                                    <View style={[styles.storyCircle, { backgroundColor: story.bg }]}>
                                        <Image
                                            source={story.image}
                                            style={styles.storyImage}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>
                                <Text
                                    style={[styles.storyName, isSelected && styles.storyNameActive]}
                                    numberOfLines={1}
                                >
                                    {story.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Sticky Container
    stickyHeaderContainer: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
        paddingTop: Spacing.xs,
        paddingBottom: Spacing.xs + 2,
        zIndex: 100,
        ...Shadows.sm,
    },

    // Row 1
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
    },
    locationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: Spacing.sm,
    },
    locationPinBox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FEE2E2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    locationTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deliverToText: {
        fontSize: FontSize.xs,
        color: Colors.gray[500],
        fontFamily: FontFamily.regular,
    },
    locationBoldText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: Colors.gray[900],
    },
    locationSubText: {
        fontSize: 10,
        color: Colors.gray[500],
        fontFamily: FontFamily.regular,
        marginTop: 1,
    },
    deliveryBadgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        borderRadius: BorderRadius.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
        gap: 3,
    },
    deliveryBadgeText: {
        fontSize: 10,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: '#047857',
    },

    // Row 2: Search + Icons
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.xs,
        paddingBottom: Spacing.xs,
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: BorderRadius.full,
        paddingHorizontal: 12,
        paddingVertical: 7,
        gap: 8,
    },
    searchPlaceholder: {
        flex: 1,
        fontSize: FontSize.xs,
        color: Colors.gray[500],
        fontFamily: FontFamily.medium,
    },
    actionIconsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconBtn: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notifDot: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.brand.crimson,
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: -2,
        backgroundColor: Colors.brand.crimson,
        borderRadius: 9,
        minWidth: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    cartBadgeText: {
        color: Colors.white,
        fontSize: 9,
        fontWeight: FontWeight.bold,
    },

    // Scrollable Categories & Stories Container
    scrollableCategoriesContainer: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
        paddingBottom: Spacing.xs,
    },

    // Row 3: Tabs
    tabsRow: {
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingTop: 2,
    },
    tabsScrollContent: {
        paddingHorizontal: Spacing.md,
        gap: 20,
    },
    tabItem: {
        paddingVertical: 7,
        position: 'relative',
    },
    tabItemActive: {},
    tabText: {
        fontSize: 11,
        fontWeight: FontWeight.bold,
        fontFamily: FontFamily.bold,
        color: Colors.gray[500],
        letterSpacing: 0.5,
    },
    tabTextActive: {
        color: Colors.brand.crimson,
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: Colors.brand.crimson,
        borderRadius: 1,
    },

    // Row 4: Stories
    storiesContainer: {
        paddingTop: 6,
        paddingBottom: 4,
        backgroundColor: '#FAFAFA',
    },
    storiesScrollContent: {
        paddingHorizontal: Spacing.md,
        gap: 14,
    },
    storyWrapper: {
        alignItems: 'center',
        width: 58,
    },
    storyRing: {
        width: 54,
        height: 54,
        borderRadius: 27,
        padding: 2,
        backgroundColor: Colors.white,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    storyRingActive: {
        borderColor: Colors.brand.crimson,
        borderWidth: 2,
    },
    storyCircle: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    storyImage: {
        width: 38,
        height: 38,
    },
    storyName: {
        fontSize: 10,
        fontFamily: FontFamily.medium,
        color: Colors.gray[700],
        marginTop: 4,
        textAlign: 'center',
    },
    storyNameActive: {
        fontWeight: FontWeight.bold,
        color: Colors.brand.crimson,
    },
});
