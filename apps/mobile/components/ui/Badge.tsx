import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, FontSize, FontWeight, BorderRadius, Spacing } from '../../constants/Colors';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default' | 'brand';

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
    dot?: boolean;
    style?: StyleProp<ViewStyle>;
}

const variantMap: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
    success: { bg: '#d1fae5', text: '#065f46', dot: Colors.success },
    warning: { bg: '#fef3c7', text: '#92400e', dot: Colors.warning },
    error: { bg: '#fee2e2', text: '#991b1b', dot: Colors.error },
    info: { bg: '#dbeafe', text: '#1e40af', dot: Colors.info },
    default: { bg: Colors.gray[100], text: Colors.gray[700], dot: Colors.gray[400] },
    brand: { bg: '#fde8e8', text: Colors.brand.burgundy, dot: Colors.brand.crimson },
};

export function Badge({ label, variant = 'default', size = 'sm', dot = false, style }: BadgeProps) {
    const v = variantMap[variant];
    const isSmall = size === 'sm';

    return (
        <View
            style={[
                styles.base,
                { backgroundColor: v.bg },
                isSmall ? styles.sm : styles.md,
                style,
            ]}
        >
            {dot && (
                <View style={[styles.dot, { backgroundColor: v.dot }]} />
            )}
            <Text style={[styles.text, { color: v.text }, isSmall ? styles.textSm : styles.textMd]}>
                {label}
            </Text>
        </View>
    );
}

/**
 * Convenience — maps OrderStatus to correct Badge variant automatically.
 */
export function StatusBadge({ status }: { status: string }) {
    const variantForStatus: Record<string, BadgeVariant> = {
        pending: 'warning',
        confirmed: 'info',
        accepted: 'info',
        delivered: 'success',
        cancelled: 'error',
    };
    const labelForStatus: Record<string, string> = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        accepted: 'Accepted',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };

    return (
        <Badge
            label={labelForStatus[status] ?? status}
            variant={variantForStatus[status] ?? 'default'}
            dot
        />
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: BorderRadius.full,
        alignSelf: 'flex-start',
    },
    sm: {
        paddingVertical: 3,
        paddingHorizontal: Spacing.sm,
    },
    md: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5,
    },
    text: {
        fontWeight: FontWeight.semibold,
    },
    textSm: {
        fontSize: FontSize.xs,
    },
    textMd: {
        fontSize: FontSize.sm,
    },
});
