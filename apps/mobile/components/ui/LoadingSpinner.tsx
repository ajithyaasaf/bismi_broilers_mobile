import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../../constants/Colors';

interface LoadingSpinnerProps {
    label?: string;
    size?: 'small' | 'large';
    fullScreen?: boolean;
}

export function LoadingSpinner({ label, size = 'large', fullScreen = false }: LoadingSpinnerProps) {
    return (
        <View style={[styles.container, fullScreen && styles.fullScreen]}>
            <ActivityIndicator color={Colors.brand.crimson} size={size} />
            {label && <Text style={styles.label}>{label}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    fullScreen: {
        flex: 1,
        backgroundColor: Colors.brand.cream,
    },
    label: {
        marginTop: 12,
        fontSize: FontSize.sm,
        color: Colors.gray[500],
    },
});
