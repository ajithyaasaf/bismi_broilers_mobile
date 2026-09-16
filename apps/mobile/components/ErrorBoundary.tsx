import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import { Colors, FontSize, FontWeight, FontFamily, Spacing, BorderRadius, Shadows } from '../constants/Colors';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
        showDetails: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
            showDetails: false,
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ErrorBoundary caught error]:', error, errorInfo);
        this.setState({ errorInfo });
    }

    private handleReload = async () => {
        try {
            await Updates.reloadAsync();
        } catch {
            this.handleReset();
        }
    };

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            showDetails: false,
        });
    };

    private toggleDetails = () => {
        this.setState((prev) => ({ showDetails: !prev.showDetails }));
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <SafeAreaView style={styles.container}>
                    <View style={styles.card}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="alert-circle" size={44} color={Colors.brand.crimson} />
                        </View>

                        <Text style={styles.title}>Something went wrong</Text>
                        <Text style={styles.subtitle}>
                            The application encountered an unexpected issue. Tap below to reload the app smoothly.
                        </Text>

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={styles.primaryButton}
                                activeOpacity={0.85}
                                onPress={this.handleReload}
                            >
                                <Ionicons name="refresh" size={18} color={Colors.white} style={{ marginRight: 8 }} />
                                <Text style={styles.primaryButtonText}>Reload App</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                activeOpacity={0.85}
                                onPress={this.handleReset}
                            >
                                <Text style={styles.secondaryButtonText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Collapsible Diagnostics */}
                        <TouchableOpacity
                            style={styles.detailsToggle}
                            onPress={this.toggleDetails}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.detailsToggleText}>
                                {this.state.showDetails ? 'Hide Diagnostics ▲' : 'Show Diagnostics ▼'}
                            </Text>
                        </TouchableOpacity>

                        {this.state.showDetails && (
                            <ScrollView style={styles.detailsBox} nestedScrollEnabled>
                                <Text style={styles.errorName}>{this.state.error?.name}: {this.state.error?.message}</Text>
                                <Text style={styles.stackText}>
                                    {this.state.error?.stack || this.state.errorInfo?.componentStack || 'No stack trace available'}
                                </Text>
                            </ScrollView>
                        )}
                    </View>
                </SafeAreaView>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.brand.cream,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        ...Shadows.md,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSize.xl,
        fontFamily: FontFamily.bold,
        color: Colors.brand.navy,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: FontSize.sm,
        fontFamily: FontFamily.regular,
        color: Colors.gray[600],
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.lg,
    },
    buttonGroup: {
        width: '100%',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.brand.crimson,
        paddingVertical: 14,
        borderRadius: BorderRadius.md,
        width: '100%',
    },
    primaryButtonText: {
        color: Colors.white,
        fontFamily: FontFamily.bold,
        fontSize: FontSize.md,
    },
    secondaryButton: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        paddingVertical: 12,
        borderRadius: BorderRadius.md,
        width: '100%',
    },
    secondaryButtonText: {
        color: Colors.brand.navy,
        fontFamily: FontFamily.semibold,
        fontSize: FontSize.sm,
    },
    detailsToggle: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginTop: Spacing.xs,
    },
    detailsToggleText: {
        color: Colors.gray[500],
        fontSize: FontSize.xs,
        fontFamily: FontFamily.medium,
    },
    detailsBox: {
        width: '100%',
        maxHeight: 160,
        backgroundColor: '#0F172A',
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        marginTop: Spacing.sm,
    },
    errorName: {
        color: '#F87171',
        fontSize: 11,
        fontFamily: FontFamily.bold,
        marginBottom: 4,
    },
    stackText: {
        color: '#94A3B8',
        fontSize: 10,
        fontFamily: FontFamily.regular,
    },
});
