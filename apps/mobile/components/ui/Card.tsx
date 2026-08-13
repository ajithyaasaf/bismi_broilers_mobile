import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows } from '../../constants/Colors';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    elevation?: 'none' | 'sm' | 'md' | 'lg';
    padding?: number;
}

export function Card({ children, style, elevation = 'md', padding = 16 }: CardProps) {
    const shadow = elevation === 'none' ? {} : Shadows[elevation];

    return (
        <View
            style={[
                styles.base,
                shadow,
                { padding },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
});
