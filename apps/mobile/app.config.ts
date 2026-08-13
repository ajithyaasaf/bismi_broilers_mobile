import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: 'Bismi Broilers',
    slug: 'bismi-broilers',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'bismi',
    userInterfaceStyle: 'light',
    icon: './assets/icon.png',
    updates: {
        fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    ios: {
        supportsTablet: false,
        bundleIdentifier: 'com.bismi.broilers',
        buildNumber: '1',
        infoPlist: {
            NSCameraUsageDescription: 'Used to scan QR codes for UPI payments.',
        },
    },
    android: {
        package: 'com.bismi.broilers',
        versionCode: 1,
        adaptiveIcon: {
            foregroundImage: './assets/android-icon-foreground.png',
            backgroundColor: '#c81e1e',
        },
        permissions: [
            'INTERNET',
            'RECEIVE_BOOT_COMPLETED',
            'VIBRATE',
        ],
        googleServicesFile: './google-services.json',
    },
    web: {
        bundler: 'metro',
        output: 'single',
        favicon: './assets/favicon.png',
    },
    plugins: [
        'expo-router',
        'expo-font',
        [
            'expo-notifications',
            {
                icon: './assets/icon.png',
                color: '#c81e1e',
                defaultChannel: 'default',
            },
        ],
        [
            'expo-build-properties',
            {
                android: {
                    usesCleartextTraffic: false,
                },
            },
        ],
    ],
    experiments: {
        typedRoutes: true,
    },
    extra: {
        // Firebase config (read from .env at build time via EXPO_PUBLIC_ prefix)
        firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        eas: {
            projectId: 'YOUR_EAS_PROJECT_ID', // Update after `eas build:configure`
        },
    },
});
