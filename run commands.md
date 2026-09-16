# 🚀 Bismi Broilers Platform — Operational Commands Manual

A quick-reference guide for developing, testing, building, and deploying the Bismi Broilers mobile and shared core platform.

---

## 📌 1. Development & Local Run

Ensure you are in the workspace root (`bismi-platform`).

### Start Expo Metro Bundler
```bash
# Start the Metro development server with interactive menu
npm run dev
# or
npm run mobile
```

### Run on Specific Targets
```bash
# Run on Web Browser (Instant Preview)
npm --prefix apps/mobile run web

# Run on Android Emulator or Connected USB Device
npm --prefix apps/mobile run android

# Run on iOS Simulator (macOS only)
npm --prefix apps/mobile run ios
```

---

## 📌 2. Type Checking & Code Quality

Always run type checks before committing or building:

```bash
# Typecheck both @bismi/core and @bismi/mobile workspaces simultaneously
npm run typecheck

# Typecheck only the shared business core
npm run typecheck --workspace=packages/core

# Typecheck only the mobile application
npm run typecheck --workspace=apps/mobile
```

---

## 📌 3. Cloudinary Asset Synchronization

To sync, organize, or update media assets in Cloudinary under the structured `bismi/` folder hierarchy:

```bash
# Uploads product, category, and banner media to Cloudinary (f_auto, q_auto optimized)
node scripts/upload-to-cloudinary.mjs
```

---

## 📌 4. Standalone Android Builds (EAS Build)

Build installable APKs or Google Play App Bundles using Expo Application Services (EAS):

```bash
# 1. Standalone Preview APK (Directly installable on any Android phone for testing)
npm --prefix apps/mobile run build:android:preview
# or directly via EAS CLI:
cd apps/mobile && eas build --platform android --profile preview

# 2. Production Android App Bundle (.aab for Google Play Store submission)
npm --prefix apps/mobile run build:android:prod
# or directly via EAS CLI:
cd apps/mobile && eas build --platform android --profile production

# 3. Submit directly to Google Play Console
npm --prefix apps/mobile run submit:android
```

---

## 📌 5. Instant Over-The-Air (OTA) Updates (EAS Update)

Because media assets are delivered via Cloudinary CDN, the app bundle is ultra-lightweight (< 2 MB). You can push instant JS/UI updates to all installed user devices in under 2 seconds without rebuilding APKs or submitting to Google Play:

```bash
# Publish instant OTA update to Production users
cd apps/mobile && eas update --branch production --message "Fix: Updated menu pricing and holiday schedule"

# Publish instant OTA update to Preview / Internal testers
cd apps/mobile && eas update --branch preview --message "Test: New cart animations"
```

---

## 📌 6. Monorepo Structure Reference

| Path | Description |
| :--- | :--- |
| `packages/core` | Pure TypeScript business logic (cart reducer, slot control, pricing, WhatsApp/UPI utils, Firestore). |
| `apps/mobile` | Expo SDK 57 React Native mobile application (Expo Router v57, Reanimated 4, Gesture Handler). |
| `scripts/` | Tooling & migration automation scripts (Cloudinary upload & asset optimization). |
