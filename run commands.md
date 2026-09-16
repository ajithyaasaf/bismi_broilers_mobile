# 🚀 Bismi Broilers Platform — Master Commands Guide

A simple, practical guide for building APKs, pushing Over-The-Air (OTA) updates, running local development, and deploying both the Mobile App and Website.

---

## 📱 1. Build Installable APK for Android Phone (EAS Build)

Use these commands whenever you want to generate a `.apk` file to install directly on your Android phone.

### Step 1: Navigate to Mobile directory
```bash
cd apps/mobile
```

### Step 2: Build the Standalone APK (Preview Profile)
```bash
npx eas build --platform android --profile preview
```

> [!TIP]
> **How to install on phone**:
> 1. When EAS finishes building in the cloud (~4–8 mins), it prints a **QR Code** and **Download URL** in your terminal.
> 2. Scan the QR code or open the link on your mobile phone to download and install `bismi-broilers.apk`.

---

## ⚡ 2. Push Instant Over-The-Air (OTA) Updates (No APK Rebuild Required!)

Whenever you modify components, fix bugs, update text, or change styles, **you do NOT need to rebuild the APK or reinstall the app on phones**.

Push an instant OTA update directly to all installed devices:

```bash
cd apps/mobile
npx eas update --channel preview --message "Fixed cart button & updated banners"
```

> [!NOTE]
> **How OTA works on user phones**:
> - Thanks to Cloudinary CDN, the OTA bundle is only **~1.2 MB**.
> - The moment any user opens the installed app on their phone, the update silently downloads in **1–2 seconds**.
> - The new code goes live on their next app launch!

---

## 💻 3. Local Mobile App Development

Run the mobile app locally on your computer, browser, or connected phone.

```bash
# Start Metro bundler (from root):
npm run dev

# Run directly on Web Browser (instant UI preview):
npm --prefix apps/mobile run web

# Run on connected Android phone / Emulator:
npm --prefix apps/mobile run android
```

---

## 🌐 4. Website Development & Production (`bismi_website`)

```bash
# Navigate to website directory
cd G:\Godivatech\Prakash\Analyzer\tech\Bismi\bismi_website

# Start Next.js local development server:
npm run dev

# Build for production deployment:
npm run build
```

---

## ☁️ 5. Cloudinary & Media Management

```bash
# Re-upload or update catalog images in Cloudinary (under bismi/ folder hierarchy):
node scripts/upload-to-cloudinary.mjs
```

---

## 🔍 6. Typecheck & Code Quality

Always run this before building to ensure 0 TypeScript errors:

```bash
# Typecheck both packages/core and apps/mobile:
npm run typecheck
```

---

## 📂 Quick Reference

| Action | Command | Where to Run |
| :--- | :--- | :--- |
| **Build Android APK** | `npx eas build --platform android --profile preview` | `apps/mobile` |
| **Push OTA Update** | `npx eas update --channel preview --message "..."` | `apps/mobile` |
| **Start Mobile Dev** | `npm run dev` | Project Root |
| **Start Website Dev** | `npm run dev` | `bismi_website` |
| **Check TypeScript** | `npm run typecheck` | Project Root |
