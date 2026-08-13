/**
 * Brand Design System — Bismi Broilers
 * Single source of truth for all colors, spacing, and typography.
 */

export const Colors = {
    // ── Brand ─────────────────────────────
    brand: {
        crimson: '#c81e1e',
        crimsonDark: '#a01818',
        crimsonLight: '#e63232',
        burgundy: '#6B141E',
        forest: '#2d5a3f',
        forestDark: '#1e3d2a',
        navy: '#1e293b',
        navyLight: '#334155',
        cream: '#fdf8f0',
        creamDark: '#f5edde',
    },

    // ── Neutral ───────────────────────────
    gray: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
    },

    // ── Semantic ──────────────────────────
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',

    // ── Status colors ─────────────────────
    status: {
        pending: { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
        confirmed: { bg: '#ede9fe', text: '#5b21b6', dot: '#8b5cf6' },
        accepted: { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
        delivered: { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
        cancelled: { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    },

    // ── Feedback ──────────────────────────
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
} as const;

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
} as const;

export const BorderRadius = {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
} as const;

export const FontSize = {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 38,
} as const;

export const FontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
} as const;

export const Shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
        elevation: 8,
    },
    brand: {
        shadowColor: '#c81e1e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
} as const;
