import fs from 'fs';
import path from 'path';

const websiteDir = 'G:/Godivatech/Prakash/Analyzer/tech/Bismi/bismi_website';

// 1. Update checkout/page.tsx
const checkoutFile = path.join(websiteDir, 'src/app/checkout/page.tsx');
let checkoutContent = fs.readFileSync(checkoutFile, 'utf8');
if (!checkoutContent.includes('resolveProductImage')) {
    checkoutContent = checkoutContent.replace(
        "import ImageWithSkeleton from '@/components/ImageWithSkeleton';",
        "import ImageWithSkeleton from '@/components/ImageWithSkeleton';\nimport { resolveProductImage } from '@/lib/imageResolver';"
    );
    checkoutContent = checkoutContent.replace(
        'src={item.imageURL}',
        'src={resolveProductImage(item.imageURL, item.meatName)}'
    );
    fs.writeFileSync(checkoutFile, checkoutContent, 'utf8');
    console.log('✅ Updated checkout/page.tsx');
}

// 2. Update admin/products/page.tsx
const adminProductsFile = path.join(websiteDir, 'src/app/admin/products/page.tsx');
let adminContent = fs.readFileSync(adminProductsFile, 'utf8');
// Clean out misplaced import if at line 1
adminContent = adminContent.replace(/^import \{ resolveProductImage \} from '@\/lib\/imageResolver';\n/, '');
adminContent = adminContent.replace("'use client';", "'use client';\n\nimport { resolveProductImage } from '@/lib/imageResolver';");
adminContent = adminContent.replace(
    '<Image src={product.imageURL} alt={product.name}',
    '<Image src={resolveProductImage(product.imageURL, product.name)} alt={product.name} unoptimized'
);
fs.writeFileSync(adminProductsFile, adminContent, 'utf8');
console.log('✅ Updated admin/products/page.tsx');

// 3. Update admin/AddProductModal.tsx presets
const addProductFile = path.join(websiteDir, 'src/components/admin/AddProductModal.tsx');
let addProductContent = fs.readFileSync(addProductFile, 'utf8');
if (!addProductContent.includes('CloudinaryImages')) {
    addProductContent = addProductContent.replace(
        "import { MeatType } from '@/types';",
        "import { MeatType } from '@/types';\nimport { CloudinaryImages } from '@/lib/imageResolver';"
    );
    addProductContent = addProductContent.replace(
        `const PRESET_IMAGES = [
    { label: 'Chicken', url: '/images/chicken.jpg' },
    { label: 'Boneless', url: '/images/chicken-boneless.jpg' },
    { label: 'Lollipop', url: '/images/chicken-lollipop.jpg' },
    { label: 'Country Chicken', url: '/images/country-chicken.jpg' },
    { label: 'Mutton', url: '/images/mutton.jpg' },
    { label: 'Kaadai / Quail', url: '/images/kaadai.jpg' },
];`,
        `const PRESET_IMAGES = [
    { label: 'Chicken Curry Cut', url: CloudinaryImages.curryCuts },
    { label: 'Chicken Biryani Cut', url: CloudinaryImages.biryaniCut },
    { label: 'Chicken Boneless', url: CloudinaryImages.chickenBoneless },
    { label: 'Chicken Lollipop', url: CloudinaryImages.chickenLollipop },
    { label: 'Country Chicken', url: CloudinaryImages.countryChicken },
    { label: 'Kaadai / Quail', url: CloudinaryImages.quailMeat },
];`
    );
    fs.writeFileSync(addProductFile, addProductContent, 'utf8');
    console.log('✅ Updated admin/AddProductModal.tsx');
}

console.log('🎉 Website components successfully updated!');
