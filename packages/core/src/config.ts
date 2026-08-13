/**
 * Central business configuration.
 * Single source of truth for both web and mobile apps.
 */
export const SHOP_CONFIG = {
    name: 'Bismi Broilers',
    tagline: 'Fresh Meat, Delivered to Your Door',
    phone: '+918681087082',
    whatsapp: '918681087082',
    email: 'bismibroilers@gmail.com',
    address: 'பிஸ்மி பிராய்லர்ஸ், ஹயர்நிஷா மருத்துவமனை அருகில், (SBI ATM) எதிரில், முதுகுளத்தூர்',
    googleMapsUrl: 'https://maps.google.com/?q=Bismi+Broilers',
    workingHours: '7:00 AM – 8:00 PM',
    workingDays: 'Monday – Sunday',

    // Order rules
    minimumOrderAmount: 100, // ₹
    deliveryCharge: 0,       // ₹ — Always free delivery
    estimatedDeliveryTime: 'Fastest Delivery',

    // Currency
    currency: '₹',
    currencyCode: 'INR',

    // UPI Payment
    upiId: '8681087082@paytm',

    // UPI deep-link (used in mobile app for direct UPI intent)
    upiDeepLinkBase: 'upi://pay',
} as const;

/**
 * Delivery zones within ~5 km of the shop.
 */
export const DELIVERY_ZONES = [
    { key: 'bus-stand', label: 'Near Bus Stand (பேருந்து நிலையம்)' },
    { key: 'sbi-atm', label: 'Near SBI ATM / Hyrnisha Hospital (SBI ATM அருகில்)' },
    { key: 'kamuthi-road', label: 'Kamuthi Road (காமுதி சாலை)' },
    { key: 'paramakudi-road', label: 'Paramakudi Road (பரமக்குடி சாலை)' },
    { key: 'main-bazaar', label: 'Main Bazaar / Market Street (மெயின் பஜார்)' },
    { key: 'mosque-street', label: 'Mosque Street / Pallivasal Street (பள்ளிவாசல் தெரு)' },
    { key: 'north-street', label: 'North Street (வடக்கு தெரு)' },
    { key: 'south-street', label: 'South Street (தெற்கு தெரு)' },
    { key: 'east-street', label: 'East Street (கிழக்கு தெரு)' },
    { key: 'west-street', label: 'West Street (மேற்கு தெரு)' },
    { key: 'keelacheval', label: 'Keelacheval (கீழச்செவல்)' },
    { key: 'melacheval', label: 'Melacheval (மேலச்செவல்)' },
    { key: 'keelaselvanur', label: 'Keelaselvanur (கீழச்செல்வனூர்)' },
    { key: 'melaselvanur', label: 'Melaselvanur (மேலச்செல்வனூர்)' },
    { key: 'other', label: 'Other (மற்றவை)' },
] as const;

export const DELIVERY_RADIUS_KM = 5;

/**
 * Sub-category grouping for the Chicken menu.
 */
export const CHICKEN_GROUPS = [
    {
        label: 'Everyday Cuts',
        names: ['Chicken Curry Cut', 'Chicken Small Curry Cut', 'Chicken Gravy Cut', 'Chicken Biriyani Cut']
    },
    {
        label: 'Special Cuts',
        names: ['Chicken Boneless', 'Chicken Breast', 'Chicken Leg', 'Chicken Wings', 'Chicken Lollipop', 'Chicken Keema']
    },
    {
        label: 'Country & Whole',
        names: ['Country Chicken (Naatu Kozhi)']
    },
];

/**
 * Meat categories for grouping products on homepage.
 */
export const CATEGORIES = [
    { id: 'chicken', name: 'Chicken', emoji: '🐔', description: 'Fresh broiler chicken cuts' },
    { id: 'kadai', name: 'Kaadai', emoji: '🐦', description: 'Fresh kaadai eggs' },
] as const;

/**
 * Order status labels and colors for UI display.
 */
export const STATUS_CONFIG = {
    pending: { label: 'Pending', colorLight: '#fef3c7', colorText: '#92400e', dot: '#f59e0b' },
    confirmed: { label: 'Confirmed', colorLight: '#ede9fe', colorText: '#5b21b6', dot: '#8b5cf6' },
    accepted: { label: 'Accepted', colorLight: '#dbeafe', colorText: '#1e40af', dot: '#3b82f6' },
    delivered: { label: 'Delivered', colorLight: '#d1fae5', colorText: '#065f46', dot: '#10b981' },
    cancelled: { label: 'Cancelled', colorLight: '#fee2e2', colorText: '#991b1b', dot: '#ef4444' },
} as const;

/**
 * Keyed delivery slots for slot control system.
 */
export const DELIVERY_SLOT_KEYS = [
    { key: '6-8', label: 'Early Morning (6 – 8 AM)', startHour: 6 },
    { key: '8-10', label: 'Morning (8 – 10 AM)', startHour: 8 },
    { key: '10-12', label: 'Late Morning (10 AM – 12 PM)', startHour: 10 },
    { key: '12-2', label: 'Afternoon (12 – 2 PM)', startHour: 12 },
    { key: '5-7', label: 'Evening (5 – 7 PM)', startHour: 17 },
    { key: '7-8', label: 'Night (7 – 8 PM)', startHour: 19 },
] as const;

/**
 * Buffer time in minutes before a delivery slot.
 */
export const BUFFER_TIME_MINUTES = 60;

/**
 * Default max orders per slot when no Firestore control document exists.
 */
export const DEFAULT_SLOT_LIMIT = 5;

/**
 * Payment methods supported in the app.
 */
export const PAYMENT_METHODS = [
    { id: 'upi', label: 'Pay via UPI', description: 'Opens GPay / PhonePe / Paytm', icon: '₹' },
    { id: 'cod', label: 'Cash on Delivery', description: 'Pay cash or UPI at delivery', icon: '💵' },
] as const;

export type PaymentMethod = typeof PAYMENT_METHODS[number]['id'];
