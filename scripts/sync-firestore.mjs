import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import {
    getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp
} from 'firebase/firestore';

// Read environment from apps/mobile/.env or bismi_website/.env
const envPath = path.resolve('apps/mobile/.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
});

const firebaseConfig = {
    apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/dj1tmb6yr/image/upload/f_auto,q_auto,w_600,c_limit';

const CLOUDINARY_PRODUCT_MAP = {
    // Chicken products
    'chicken curry cut': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/curry-cuts`,
    'chicken biryani cut': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/biryani-cut`,
    'chicken biriyani cut': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/biryani-cut`,
    'chicken boneless': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/chicken-boneless`,
    'chicken boneless cubes': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/boneless-cubes`,
    'chicken breast': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/chicken-breasts`,
    'chicken small curry cut': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/curry-cut-small`,
    'chicken gravy cut': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/curry-cut-large`,
    'chicken drumsticks': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/drumsticks`,
    'chicken leg': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/leg-piece`,
    'chicken leg piece': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/leg-piece`,
    'chicken wings': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/chicken-wings`,
    'chicken lollipop': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/chicken-lollipop`,
    'chicken keema': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/chicken-keema`,
    'raw whole chicken': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/raw-whole-chicken`,
    'country chicken': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/country-chicken`,
    'country chicken (naatu kozhi)': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/country-chicken`,
    'white egg': `${CLOUDINARY_BASE_URL}/bismi/products/chicken/white-egg`,

    // Kaadai products
    'kaadai (farm quail)': `${CLOUDINARY_BASE_URL}/bismi/products/kadai/quail-meat`,
    'kaadai (quail)': `${CLOUDINARY_BASE_URL}/bismi/products/kadai/quail-meat`,
    'kaadai meat': `${CLOUDINARY_BASE_URL}/bismi/products/kadai/quail-meat`,
    'kaadai egg (quail egg)': `${CLOUDINARY_BASE_URL}/bismi/products/kadai/quail-egg`,
    'quail egg': `${CLOUDINARY_BASE_URL}/bismi/products/kadai/quail-egg`,
};

function resolveCloudinaryUrl(name) {
    const lower = name.toLowerCase().trim();
    if (CLOUDINARY_PRODUCT_MAP[lower]) return CLOUDINARY_PRODUCT_MAP[lower];

    for (const [key, url] of Object.entries(CLOUDINARY_PRODUCT_MAP)) {
        if (lower.includes(key) || key.includes(lower)) return url;
    }
    return null;
}

async function syncFirestore() {
    console.log('📡 Connecting to Firebase Project:', firebaseConfig.projectId);
    const snapshot = await getDocs(collection(db, 'meatTypes'));
    console.log(`Found ${snapshot.docs.length} products in Firestore collection "meatTypes".\n`);

    let updated = 0;
    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const cldUrl = resolveCloudinaryUrl(data.name || '');

        if (cldUrl) {
            await updateDoc(doc(db, 'meatTypes', docSnap.id), {
                imageURL: cldUrl,
                updatedAt: serverTimestamp(),
            });
            console.log(`  ✅ ${data.name} (${docSnap.id}) -> ${cldUrl}`);
            updated++;
        } else {
            console.warn(`  ⚠️ No matching Cloudinary URL for: ${data.name}`);
        }
    }

    console.log(`\n🎉 Completed sync: ${updated}/${snapshot.docs.length} products updated in Firestore!`);
}

syncFirestore().catch((err) => {
    console.error('❌ Failed syncing Firestore:', err);
    process.exit(1);
});
