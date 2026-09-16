import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 1. Read environment variables from apps/mobile/.env
const envPath = path.resolve('apps/mobile/.env');
if (!fs.existsSync(envPath)) {
    console.error('Error: apps/mobile/.env not found!');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
});

const cloudName = env.CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    console.error('Error: Cloudinary credentials missing in apps/mobile/.env');
    process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

console.log(`\n☁️  Cloudinary Account: ${cloudName}`);
console.log('📁 Verifying and creating organized Bismi folder hierarchy...');

// 2. Target folders in Cloudinary Media Library
const FOLDERS_TO_CREATE = [
    'bismi',
    'bismi/products',
    'bismi/products/chicken',
    'bismi/products/kadai',
    'bismi/categories',
    'bismi/mobile',
    'bismi/mobile/banners',
];

async function ensureFolders() {
    for (const folder of FOLDERS_TO_CREATE) {
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/folders/${encodeURIComponent(folder)}`, {
                method: 'POST',
                headers: { Authorization: authHeader },
            });
            const data = await res.json();
            if (data.success || data.path) {
                console.log(`  📂 Folder ready: ${folder}`);
            }
        } catch (err) {
            console.warn(`  ⚠️ Could not create folder ${folder}:`, err.message);
        }
    }
}

// 3. Define the exact asset list with dedicated asset_folder destinations
const ASSETS_TO_UPLOAD = [
    // ─── Products / Chicken (Shared across Mobile & Future Web) ───────
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/Curry Cuts.png',
        publicId: 'bismi/products/chicken/curry-cuts',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Curry Cut',
        key: 'curryCuts',
        name: 'Chicken Curry Cut',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/Briyani cut.webp',
        publicId: 'bismi/products/chicken/biryani-cut',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Biriyani Cut',
        key: 'biryaniCut',
        name: 'Chicken Biriyani Cut',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/Boneless Cubes.png',
        publicId: 'bismi/products/chicken/boneless-cubes',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Boneless Cubes',
        key: 'bonelessCubes',
        name: 'Chicken Boneless Cubes',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/chicken boneless.png',
        publicId: 'bismi/products/chicken/chicken-boneless',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Boneless',
        key: 'chickenBoneless',
        name: 'Chicken Boneless',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/Chicken Breasts.png',
        publicId: 'bismi/products/chicken/chicken-breasts',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Breast',
        key: 'chickenBreasts',
        name: 'Chicken Breast',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/Chicken curry cut small pieces.png',
        publicId: 'bismi/products/chicken/curry-cut-small',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Small Curry Cut',
        key: 'curryCutSmall',
        name: 'Chicken Small Curry Cut',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/chicken curry cuts large pieces.png',
        publicId: 'bismi/products/chicken/curry-cut-large',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Gravy Cut',
        key: 'curryCutLarge',
        name: 'Chicken Gravy Cut',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/Drumsticks.png',
        publicId: 'bismi/products/chicken/drumsticks',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Drumsticks',
        key: 'drumsticks',
        name: 'Chicken Drumsticks',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/Gravy cut.webp',
        publicId: 'bismi/products/chicken/gravy-cut',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Gravy Cut Webp',
        key: 'gravyCut',
        name: 'Chicken Gravy Cut (Webp)',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/Leg piece.png',
        publicId: 'bismi/products/chicken/leg-piece',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Leg Piece',
        key: 'legPiece',
        name: 'Chicken Leg Piece',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/Chicken Wings.png',
        publicId: 'bismi/products/chicken/chicken-wings',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Wings',
        key: 'chickenWings',
        name: 'Chicken Wings',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/chicken lollipop.png',
        publicId: 'bismi/products/chicken/chicken-lollipop',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Lollipop',
        key: 'chickenLollipop',
        name: 'Chicken Lollipop',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/chicken keema.png',
        publicId: 'bismi/products/chicken/chicken-keema',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Chicken Keema',
        key: 'chickenKeema',
        name: 'Chicken Keema',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/Raw Whole Chicken.png',
        publicId: 'bismi/products/chicken/raw-whole-chicken',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Raw Whole Chicken',
        key: 'rawWholeChicken',
        name: 'Raw Whole Chicken',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/country chicken.png',
        publicId: 'bismi/products/chicken/country-chicken',
        assetFolder: 'bismi/products/chicken',
        displayName: 'Country Chicken',
        key: 'countryChicken',
        name: 'Country Chicken (Naatu Kozhi)',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/white egg.png',
        publicId: 'bismi/products/chicken/white-egg',
        assetFolder: 'bismi/products/chicken',
        displayName: 'White Egg',
        key: 'whiteEgg',
        name: 'White Egg',
    },

    // ─── Products / Kadai (Quail) (Shared across Mobile & Web) ─
    {
        filePath: 'apps/mobile/assets/images/Product images/Quail/quail.webp',
        publicId: 'bismi/products/kadai/quail-meat',
        assetFolder: 'bismi/products/kadai',
        displayName: 'Kaadai Quail Meat',
        key: 'quailMeat',
        name: 'Kaadai (Farm Quail)',
    },
    {
        filePath: 'apps/mobile/assets/images/Product images/chicken/quail egg.png',
        publicId: 'bismi/products/kadai/quail-egg',
        assetFolder: 'bismi/products/kadai',
        displayName: 'Kaadai Quail Egg',
        key: 'quailEgg',
        name: 'Kaadai Egg (Quail Egg)',
    },

    // ─── Categories (Shared across Mobile & Web) ───────────────
    {
        filePath: 'apps/mobile/assets/images/Category images/chicken.avif',
        publicId: 'bismi/categories/chicken',
        assetFolder: 'bismi/categories',
        displayName: 'Category Chicken',
        key: 'categoryChicken',
        name: 'Category Chicken',
    },
    {
        filePath: 'apps/mobile/assets/images/Category images/quail.png',
        publicId: 'bismi/categories/kadai',
        assetFolder: 'bismi/categories',
        displayName: 'Category Kaadai',
        key: 'categoryKadai',
        name: 'Category Kaadai',
    },

    // ─── Mobile Banners & Hero (Mobile-specific) ──────────────
    {
        filePath: 'apps/mobile/assets/images/hero section images/3D Speed Delivery Rider.png',
        publicId: 'bismi/mobile/banners/speed-delivery-rider',
        assetFolder: 'bismi/mobile/banners',
        displayName: '3D Speed Delivery Rider',
        key: 'bannerSpeedDeliveryRider',
        name: '3D Speed Delivery Rider',
    },
    {
        filePath: 'apps/mobile/assets/images/hero section images/biryani_cutout.png',
        publicId: 'bismi/mobile/banners/biryani-cutout',
        assetFolder: 'bismi/mobile/banners',
        displayName: 'Sunday Biryani Cutout',
        key: 'bannerBiryaniCutout',
        name: 'Sunday Biryani Cutout',
    },
    {
        filePath: 'apps/mobile/assets/images/hero section images/coupon_cutout.png',
        publicId: 'bismi/mobile/banners/coupon-cutout',
        assetFolder: 'bismi/mobile/banners',
        displayName: 'Offer Coupon Cutout',
        key: 'bannerCouponCutout',
        name: 'Offer Coupon Cutout',
    },
    {
        filePath: 'apps/mobile/assets/images/why-choose-us/delivery_guy_scooter.png',
        publicId: 'bismi/mobile/banners/delivery-guy-scooter',
        assetFolder: 'bismi/mobile/banners',
        displayName: 'Delivery Guy Scooter',
        key: 'scooterDeliveryGuy',
        name: 'Delivery Guy Scooter',
    },
];

function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.png') return 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.avif') return 'image/avif';
    return 'application/octet-stream';
}

async function uploadSingleAsset(item, maxRetries = 3) {
    const { filePath, publicId, assetFolder, displayName, name } = item;

    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Skipping missing local file: ${filePath}`);
        return null;
    }

    const fileSizeMb = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const timestamp = Math.round(Date.now() / 1000).toString();

            const paramsToSign = {
                asset_folder: assetFolder,
                display_name: displayName,
                overwrite: 'true',
                public_id: publicId,
                timestamp: timestamp,
            };

            const sortedKeys = Object.keys(paramsToSign).sort();
            const strToSign = sortedKeys.map((k) => `${k}=${paramsToSign[k]}`).join('&') + apiSecret;
            const signature = crypto.createHash('sha1').update(strToSign).digest('hex');

            const fileBuffer = fs.readFileSync(filePath);
            const mime = getMimeType(filePath);
            const blob = new Blob([fileBuffer], { type: mime });

            const formData = new FormData();
            formData.append('file', blob, path.basename(filePath));
            for (const key of sortedKeys) {
                formData.append(key, paramsToSign[key]);
            }
            formData.append('api_key', apiKey);
            formData.append('signature', signature);

            const start = Date.now();
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            const duration = ((Date.now() - start) / 1000).toFixed(1);

            if (data.secure_url) {
                console.log(`✅ [${duration}s] ${name} (${fileSizeMb} MB) -> [${assetFolder}] / ${publicId}`);
                return {
                    publicId,
                    assetFolder,
                    secureUrl: data.secure_url,
                    optimizedUrl: `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_600,c_limit/${publicId}`,
                };
            } else {
                console.warn(`⚠️ [Attempt ${attempt}/${maxRetries}] Failed uploading ${name}:`, data.error?.message || data);
                if (attempt < maxRetries) await new Promise((r) => setTimeout(r, 2000));
            }
        } catch (err) {
            console.warn(`⚠️ [Attempt ${attempt}/${maxRetries}] Network error uploading ${name}:`, err.message);
            if (attempt < maxRetries) await new Promise((r) => setTimeout(r, 3000));
        }
    }

    console.error(`❌ Exhausted retries for ${name}`);
    return null;
}

async function runPool(items, limit, workerFn) {
    const results = [];
    const executing = [];

    for (const item of items) {
        const p = Promise.resolve().then(() => workerFn(item));
        results.push(p);

        if (limit <= items.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= limit) {
                await Promise.race(executing);
            }
        }
    }

    return Promise.all(results);
}

async function run() {
    await ensureFolders();

    console.log(`\n📡 Uploading ${ASSETS_TO_UPLOAD.length} assets with concurrency 2...\n`);
    const totalStart = Date.now();

    const uploadOutputs = await runPool(ASSETS_TO_UPLOAD, 2, async (item) => {
        const res = await uploadSingleAsset(item);
        if (res) {
            return { key: item.key, ...res, name: item.name };
        }
        return null;
    });

    const results = {};
    for (const out of uploadOutputs) {
        if (out) {
            results[out.key] = out;
        }
    }

    const totalSeconds = ((Date.now() - totalStart) / 1000).toFixed(1);
    console.log(`\n🎉 Upload completed in ${totalSeconds}s! ${Object.keys(results).length}/${ASSETS_TO_UPLOAD.length} assets successfully hosted.`);

    // Generate apps/mobile/constants/CloudinaryImages.ts
    const outputTsPath = path.resolve('apps/mobile/constants/CloudinaryImages.ts');
    const tsContent = `/**
 * Bismi Broilers — Cloudinary CDN Image Mapping
 * Auto-generated by scripts/upload-to-cloudinary.mjs
 * 
 * Cloud Name: ${cloudName}
 * All URLs use f_auto,q_auto for optimal mobile performance and minimal bandwidth.
 */

export const CLOUDINARY_BASE_URL = 'https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto';

export const CloudinaryImages = {
${Object.entries(results)
    .map(([key, info]) => `    /** ${info.name} */\n    ${key}: '${info.optimizedUrl}',`)
    .join('\n\n')}
} as const;

export type CloudinaryImageKey = keyof typeof CloudinaryImages;
`;

    fs.writeFileSync(outputTsPath, tsContent, 'utf-8');
    console.log(`\n📄 Generated TypeScript map at: ${outputTsPath}`);
}

run().catch(console.error);
