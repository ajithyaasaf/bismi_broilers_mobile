import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Animated,
    PanResponder,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../constants/Colors';
import { Button } from './ui/Button';

const SLIDE_DURATION = 4500;

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

export function SwiggyAnimatedHero() {
    const [activeIndex, setActiveIndex] = useState(0);

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    // Continuous floating bob on PNG cutout
    useEffect(() => {
        const floatLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -5,
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

    const changeSlide = useCallback((newIndex: number) => {
        Animated.timing(fadeAnim, {
            toValue: 0.2,
            duration: 140,
            useNativeDriver: true,
        }).start(() => {
            setActiveIndex(newIndex);
            progressAnim.setValue(0);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }).start();
        });
    }, [fadeAnim, progressAnim]);

    const nextSlide = useCallback(() => {
        changeSlide((activeIndex + 1) % SLIDES.length);
    }, [activeIndex, changeSlide]);

    const prevSlide = useCallback(() => {
        changeSlide((activeIndex - 1 + SLIDES.length) % SLIDES.length);
    }, [activeIndex, changeSlide]);

    // Auto-advance timer with smooth progress bar
    useEffect(() => {
        progressAnim.setValue(0);
        const anim = Animated.timing(progressAnim, {
            toValue: 1,
            duration: SLIDE_DURATION,
            useNativeDriver: false,
        });

        anim.start(({ finished }) => {
            if (finished) {
                nextSlide();
            }
        });

        return () => anim.stop();
    }, [activeIndex, nextSlide, progressAnim]);

    // Touch swipe responder
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20,
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dx < -35) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    nextSlide();
                } else if (gesture.dx > 35) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    prevSlide();
                }
            },
        })
    ).current;

    const current = SLIDES[activeIndex];

    return (
        <View style={styles.hero} {...panResponder.panHandlers}>
            <Animated.View style={[styles.heroRow, { opacity: fadeAnim }]}>
                {/* Left Side: Badge, Title, Subtitle, CTA */}
                <View style={styles.heroContent}>
                    <View style={styles.freeBadge}>
                        <Ionicons name={current.badgeIcon} size={12} color={Colors.brand.crimson} />
                        <Text style={styles.freeBadgeText}>{current.badgeText}</Text>
                    </View>

                    <Text style={styles.heroTitle}>{current.title}</Text>

                    <Text style={styles.heroSubtitle}>
                        {current.subtitle}
                    </Text>

                    <Button
                        variant="primary"
                        size="md"
                        onPress={() => router.push('/(tabs)/menu')}
                        style={styles.heroBtn}
                        rightIcon={<Ionicons name="arrow-forward" size={15} color={Colors.white} />}
                    >
                        {current.btnText}
                    </Button>
                </View>

                {/* Right Side: Animated Floating Cutout Image */}
                <Animated.View
                    style={[
                        styles.imageWrapper,
                        { transform: [{ translateY: floatAnim }] },
                    ]}
                >
                    <Image
                        key={current.id}
                        source={current.image}
                        style={styles.heroImage}
                        resizeMode="contain"
                    />
                </Animated.View>
            </Animated.View>

            {/* Segmented Progress Indicators */}
            <View style={styles.indicatorsRow}>
                {SLIDES.map((slide, idx) => {
                    const isActive = idx === activeIndex;
                    const isPast = idx < activeIndex;

                    const widthInterpolated = isActive
                        ? progressAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [6, 22],
                        })
                        : isPast
                        ? 22
                        : 6;

                    return (
                        <TouchableOpacity
                            key={slide.id}
                            activeOpacity={0.8}
                            onPress={() => {
                                Haptics.selectionAsync();
                                changeSlide(idx);
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
                        >
                            <Animated.View
                                style={[
                                    styles.indicatorDot,
                                    {
                                        width: widthInterpolated,
                                        backgroundColor: isActive || isPast
                                            ? Colors.white
                                            : 'rgba(255, 255, 255, 0.35)',
                                    },
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
        backgroundColor: Colors.brand.crimson,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
        borderBottomLeftRadius: BorderRadius.xl,
        borderBottomRightRadius: BorderRadius.xl,
        overflow: 'hidden',
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
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        alignSelf: 'flex-start',
        gap: 4,
        marginBottom: Spacing.xs,
    },
    freeBadgeText: {
        fontSize: 10,
        fontWeight: FontWeight.bold,
        color: Colors.brand.crimson,
        letterSpacing: 0.3,
    },
    heroTitle: {
        fontSize: FontSize['2xl'],
        fontWeight: FontWeight.extrabold,
        color: Colors.white,
        lineHeight: 28,
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
        marginTop: Spacing.sm,
    },
    indicatorDot: {
        height: 3.5,
        borderRadius: 2,
    },
});
