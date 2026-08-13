import React from 'react';
import {
    TouchableOpacity,
    TouchableOpacityProps,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing, Shadows } from '../../constants/Colors';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    haptic?: boolean;
}

const variantStyles = {
    primary: {
        container: { backgroundColor: Colors.brand.crimson, ...Shadows.brand },
        text: { color: Colors.white },
        disabled: { backgroundColor: Colors.gray[300] },
    },
    secondary: {
        container: { backgroundColor: Colors.brand.navy },
        text: { color: Colors.white },
        disabled: { backgroundColor: Colors.gray[300] },
    },
    outline: {
        container: {
            backgroundColor: Colors.transparent,
            borderWidth: 2,
            borderColor: Colors.brand.crimson,
        },
        text: { color: Colors.brand.crimson },
        disabled: { borderColor: Colors.gray[300] },
    },
    ghost: {
        container: { backgroundColor: Colors.transparent },
        text: { color: Colors.brand.crimson },
        disabled: {},
    },
    danger: {
        container: { backgroundColor: Colors.error, ...Shadows.brand },
        text: { color: Colors.white },
        disabled: { backgroundColor: Colors.gray[300] },
    },
};

const sizeStyles = {
    sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, fontSize: FontSize.sm },
    md: { paddingVertical: 12, paddingHorizontal: Spacing.md, fontSize: FontSize.base },
    lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, fontSize: FontSize.lg },
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    haptic = true,
    disabled,
    onPress,
    style,
    ...props
}: ButtonProps) {
    const v = variantStyles[variant];
    const s = sizeStyles[size];
    const isDisabled = disabled || loading;

    const handlePress = async (e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
        if (haptic && !isDisabled) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onPress?.(e);
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            disabled={isDisabled}
            onPress={handlePress}
            style={[
                styles.base,
                v.container,
                isDisabled && v.disabled,
                { paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal },
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? Colors.brand.crimson : Colors.white}
                    size="small"
                />
            ) : (
                <View style={styles.content}>
                    {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
                    <Text
                        style={[
                            styles.text,
                            v.text,
                            { fontSize: s.fontSize },
                            isDisabled && styles.disabledText,
                        ]}
                    >
                        {children}
                    </Text>
                    {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    fullWidth: {
        width: '100%',
    },
    disabled: {
        opacity: 0.6,
    },
    disabledText: {
        color: Colors.gray[500],
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        fontWeight: FontWeight.semibold,
        textAlign: 'center',
    },
    iconLeft: {
        marginRight: Spacing.xs,
    },
    iconRight: {
        marginLeft: Spacing.xs,
    },
});
