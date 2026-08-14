# 🎨 Bismi Mobile App — Floating Cart Color Palette Presets

This document archives the 4 curated color combinations developed for the **Floating Sticky Cart Bar** (`apps/mobile/components/ui/FloatingCartBar.tsx`). You can switch between these presets anytime by referencing the token values and style definitions below.

---

## 📌 Summary of Presets

| Preset | Theme Name | Base Dock Color | CTA Button | Item Count Text | Total Price | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Combo 1** | Royal Burgundy Luxury | `#6B141E` (Burgundy) | White Pill + Crimson Text | `#FDE68A` (Golden Honey) | `#FFFFFF` (White) | Archived |
| **Combo 2** | Modern Slate Dock | `#1E293B` (Deep Navy) | Crimson Pill + White Text | `#94A3B8` (Cool Slate) | `#FFFFFF` (White) | **✅ ACTIVE** |
| **Combo 3** | Frosted Light Theme | `#FFFFFF` (Ivory / White) | Crimson Pill + White Text | `#64748B` (Muted Slate) | `#0F172A` (Navy/Black) | Archived |
| **Combo 4** | Halal Forest Green | `#1E3D2A` (Dark Forest) | White Pill + Green Text | `#A7F3D0` (Mint Accent) | `#FFFFFF` (White) | Archived |

---

## 🌟 Combo Specifications & Ready-to-Use Code

### 🔹 Combo 1: Royal Burgundy & Crisp White CTA (Artisanal Wine Luxury)
* **Design Rationale**: Uses Bismi's core `Colors.brand.burgundy` token. Gives a rich, butcher-shop artisan aesthetic that eliminates red eye-strain while preserving heritage colors.
* **Tokens**:
  * **Bar Background**: `Colors.brand.burgundy` (`#6B141E`)
  * **Border**: `rgba(255, 255, 255, 0.16)`
  * **Item Count**: `#FDE68A` (Golden Cream)
  * **Total Price**: `#FFFFFF`
  * **View Cart Button**: `backgroundColor: Colors.white`, `textColor: Colors.brand.crimson` (`#C81E1E`)
  * **Close Capsule**: `backgroundColor: '#DC2626'`

```tsx
// Combo 1 Styles
bar: {
    backgroundColor: Colors.brand.burgundy, // #6B141E
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: Colors.brand.burgundy,
    ...
},
itemCountText: { color: '#FDE68A' },
totalText: { color: Colors.white },
viewCartButton: {
    backgroundColor: Colors.white,
},
viewCartText: {
    color: Colors.brand.crimson,
}
```

---

### 🔹 Combo 2: Deep Slate Navy & Vibrant Crimson CTA (**CURRENTLY ACTIVE**)
* **Design Rationale**: Modern Swiggy/Zepto inspired dark floating dock. High contrast against light food cards, drawing instant focus to the primary Crimson `View Cart →` action.
* **Tokens**:
  * **Bar Background**: `Colors.brand.navy` (`#1E293B`)
  * **Border**: `rgba(255, 255, 255, 0.14)`
  * **Item Count**: `#94A3B8` (Cool Slate)
  * **Total Price**: `#FFFFFF`
  * **View Cart Button**: `backgroundColor: Colors.brand.crimson` (`#C81E1E`), `textColor: Colors.white`
  * **Close Capsule**: `backgroundColor: '#DC2626'`

```tsx
// Combo 2 Styles (Active)
bar: {
    backgroundColor: Colors.brand.navy, // #1E293B
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: Colors.brand.navy,
    ...
},
itemCountText: { color: '#94A3B8' },
totalText: { color: Colors.white },
viewCartButton: {
    backgroundColor: Colors.brand.crimson, // #C81E1E
},
viewCartText: {
    color: Colors.white,
}
```

---

### 🔹 Combo 3: Frosted Pure White & Crimson CTA (Light Mode Minimalism)
* **Design Rationale**: Clean, minimalist light-themed dock. Sits gracefully on light backgrounds with a delicate rose-tinted border (`#FEE2E2`).
* **Tokens**:
  * **Bar Background**: `#FFFFFF` (Pure White)
  * **Border**: `1.5px solid #FEE2E2` (Rose Blush)
  * **Cart Circle**: `#FEE2E2` with `#C81E1E` cart icon
  * **Item Count**: `#64748B` (Muted Slate)
  * **Total Price**: `#0F172A` (Deep Navy / Black)
  * **View Cart Button**: `backgroundColor: Colors.brand.crimson` (`#C81E1E`), `textColor: Colors.white`
  * **Close Capsule**: `backgroundColor: '#DC2626'`

```tsx
// Combo 3 Styles
bar: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    ...
},
cartIconCircle: { backgroundColor: '#FEE2E2' },
itemCountText: { color: '#64748B' },
totalText: { color: '#0F172A' },
viewCartButton: {
    backgroundColor: Colors.brand.crimson,
},
viewCartText: {
    color: Colors.white,
}
```

---

### 🔹 Combo 4: Halal Forest Green & Crisp White CTA (Fresh Butchery / Organic)
* **Design Rationale**: Sourced from Bismi's 100% Halal Certified identity (`Colors.brand.forestDark`). Represents organic freshness and high health standards.
* **Tokens**:
  * **Bar Background**: `Colors.brand.forestDark` (`#1E3D2A`)
  * **Border**: `rgba(255, 255, 255, 0.16)`
  * **Badge Dot**: `#10B981` (Emerald Green)
  * **Item Count**: `#A7F3D0` (Mint Accent)
  * **Total Price**: `#FFFFFF`
  * **View Cart Button**: `backgroundColor: Colors.white`, `textColor: #1E3D2A` (Forest Green)
  * **Close Capsule**: `backgroundColor: '#DC2626'`

```tsx
// Combo 4 Styles
bar: {
    backgroundColor: '#1E3D2A',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#1E3D2A',
    ...
},
itemCountText: { color: '#A7F3D0' },
totalText: { color: Colors.white },
viewCartButton: {
    backgroundColor: Colors.white,
},
viewCartText: {
    color: '#1E3D2A',
}
```

---

## 🛠️ How to Switch Presets in the Codebase

1. Open [`FloatingCartBar.tsx`](file:///g:/Godivatech/Prakash/Analyzer/tech/Bismi/bismi-platform/apps/mobile/components/ui/FloatingCartBar.tsx).
2. Locate `styles.bar`, `styles.itemCountText`, `styles.totalText`, `styles.viewCartButton`, and `styles.viewCartText`.
3. Paste the colors from the desired combo above!
