import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Button } from './ui/Button';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AUTO_PLAY_INTERVAL = 4500;

interface SlideItem {
    id: number;
    badgeIcon: keyof typeof Ionicons.glyphMap;
    badgeText: string;
    title: string;
    subtitle: string;
    btnText: string;
    image: any;
}

const SLIDES: SlideItem[] = [
    {
        id: 0,
        badgeIcon: 'flash',
        badgeText: 'FREE DELIVERY',
        title: 'Fresh Meat\nat Your Door',
        subtitle: 'Freshly cut daily in Mudukulattur.\nFastest delivery guaranteed.',
        btnText: 'Order Now',
        image: require('../assets/images/hero section images/3D Speed Delivery Rider.png'),
    },
    {
        id: 1,
        badgeIcon: 'calendar',
        badgeText: 'PRE-BOOK TOMORROW',
        title: 'Sunday Biryani\nGrand Feast?',
        subtitle: 'Pre-book tender cuts tonight.\nGuaranteed 7 AM delivery.',
        btnText: 'Pre-Book Now',
        image: require('../assets/images/hero section images/biryani_cutout.png'),
    },
    {
        id: 2,
        badgeIcon: 'gift',
        badgeText: 'FLAT ₹50 OFF',
        title: 'Save ₹50 on\nFirst Order',
        subtitle: 'Use code BISMI50 at checkout.\nValid on all meat products.',
        btnText: 'Claim ₹50',
        image: require('../assets/images/hero section images/coupon_cutout.png'),
    },
];

/**
 * Full-Width Native Banner Carousel:
 * - 100% Full-Width (SCREEN_WIDTH) with luxury curved bottom dock.
 * - Native FlatList with pagingEnabled for buttery-smooth, frictionless 60-120fps sliding.
 * - Continuous floating bob animation on all 3 distinct 3D PNG cutouts.
 * - Auto-scroll with smart touch-interaction pause.
 */
export function SwiggyAnimatedHero() {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const isInteracting = useRef(false);
    const floatAnim = useRef(new Animated.Value(0)).current;

    // Continuous floating bob micro-animation on PNG cutouts
    useEffect(() => {
        const floatLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -6,
                    duration: 1600,
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1600,
                    useNativeDriver: true,
                }),
            ])
        );
        floatLoop.start();
        return () => floatLoop.stop();
    }, [floatAnim]);

    // Auto-advance slider
    useEffect(() => {
        const timer = setInterval(() => {
            if (!isInteracting.current && flatListRef.current) {
                const nextIndex = (activeIndex + 1) % SLIDES.length;
                flatListRef.current.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                });
                setActiveIndex(nextIndex);
            }
        }, AUTO_PLAY_INTERVAL);

        return () => clearInterval(timer);
    }, [activeIndex]);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollOffset / SCREEN_WIDTH);
        if (index >= 0 && index < SLIDES.length && index !== activeIndex) {
            setActiveIndex(index);
        }
    }, [activeIndex]);

    const handleScrollBegin = () => {
        isInteracting.current = true;
    };

    const handleScrollEnd = () => {
        setTimeout(() => {
            isInteracting.current = false;
        }, 1500);
    };

    const scrollToSlide = (index: number) => {
        Haptics.selectionAsync();
        setActiveIndex(index);
        flatListRef.current?.scrollToIndex({
            index,
            animated: true,
        });
    };

    const renderSlide = ({ item }: { item: SlideItem }) => (
        <View style={styles.slidePage}>
            <View style={styles.heroRow}>
                {/* Left Side: Badge, Title, Subtitle, CTA */}
                <View style={styles.heroContent}>
                    <View style={styles.freeBadge}>
                        <Ionicons name={item.badgeIcon} size={11} color={Colors.brand.crimson} />
                        <Text style={styles.freeBadgeText}>{item.badgeText}</Text>
                    </View>

                    <Text style={styles.heroTitle}>{item.title}</Text>

                    <Text style={styles.heroSubtitle}>
                        {item.subtitle}
                    </Text>

                    <Button
                        variant="primary"
                        size="sm"
                        onPress={() => router.push('/(tabs)/menu')}
                        style={styles.heroBtn}
                        rightIcon={<Ionicons name="arrow-forward" size={14} color={Colors.white} />}
                    >
                        {item.btnText}
                    </Button>
                </View>

                {/* Right Side: Animated Floating 3D PNG Cutout */}
                <Animated.View
                    style={[
                        styles.imageWrapper,
                        { transform: [{ translateY: floatAnim }] },
                    ]}
                >
                    <Image
                        source={item.image}
                        style={styles.heroImage}
                        resizeMode="contain"
                    />
                </Animated.View>
            </View>
        </View>
    );

    return (
        <View style={styles.hero}>
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderSlide}
                horizontal
                pagingEnabled={true}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onScrollBeginDrag={handleScrollBegin}
                onMomentumScrollEnd={handleScrollEnd}
                getItemLayout={(_, index) => ({
                    length: SCREEN_WIDTH,
                    offset: SCREEN_WIDTH * index,
                    index,
                })}
            />

            {/* Pagination Indicators */}
            <View style={styles.indicatorsRow}>
                {SLIDES.map((slide, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                        <TouchableOpacity
                            key={slide.id}
                            onPress={() => scrollToSlide(idx)}
                            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                        >
                            <View
                                style={[
                                    styles.indicatorDot,
                                    isActive && styles.indicatorDotActive,
                                ]}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    hero: {
        width: SCREEN_WIDTH,
        backgroundColor: Colors.brand.crimson,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
        borderBottomLeftRadius: BorderRadius.xl, // 20px
        borderBottomRightRadius: BorderRadius.xl,
        overflow: 'hidden',
    },
    slidePage: {
        width: SCREEN_WIDTH,
        paddingHorizontal: Spacing.md,
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 145,
    },
    heroContent: {
        flex: 1,
        marginRight: Spacing.xs,
    },
    freeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.full,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        gap: 4,
        marginBottom: Spacing.xs,
    },
    freeBadgeText: {
        fontSize: 9.5,
        fontWeight: FontWeight.bold,
        color: Colors.brand.crimson,
        letterSpacing: 0.3,
    },
    heroTitle: {
        fontSize: FontSize['2xl'] - 2, // 22px
        fontWeight: FontWeight.extrabold,
        color: Colors.white,
        lineHeight: 26,
        marginVertical: Spacing.xs,
    },
    heroSubtitle: {
        fontSize: FontSize.xs,
        color: 'rgba(255,255,255,0.92)',
        lineHeight: 16,
        marginBottom: Spacing.md,
    },
    heroBtn: {
        alignSelf: 'flex-start',
    },
    imageWrapper: {
        width: 135,
        height: 135,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroImage: {
        width: 130,
        height: 130,
    },
    indicatorsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: Spacing.xs,
    },
    indicatorDot: {
        width: 6,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.35)',
    },
    indicatorDotActive: {
        width: 22,
        backgroundColor: Colors.white,
    },
});
