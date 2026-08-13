import { ImageSourcePropType } from 'react-native';

const FALLBACK_IMAGE = require('../assets/images/Product images/chicken/Curry Cuts.png');

const PRODUCT_IMAGE_MAP: Record<string, ImageSourcePropType> = {
    '/assets/images/Product images/chicken/Chicken Breasts.png': require('../assets/images/Product images/chicken/Chicken Breasts.png'),
    '/assets/images/Product images/chicken/Curry Cuts.png': require('../assets/images/Product images/chicken/Curry Cuts.png'),
    '/assets/images/Product images/chicken/Leg piece.png': require('../assets/images/Product images/chicken/Leg piece.png'),
    '/assets/images/Product images/chicken/Chicken Wings.png': require('../assets/images/Product images/chicken/Chicken Wings.png'),
    '/assets/images/Product images/Quail/quail.webp': require('../assets/images/Product images/Quail/quail.webp'),
    '/assets/images/Product images/chicken/chicken boneless.png': require('../assets/images/Product images/chicken/chicken boneless.png'),
    '/assets/images/Product images/chicken/Briyani cut.webp': require('../assets/images/Product images/chicken/Briyani cut.webp'),
    '/assets/images/Product images/chicken/Chicken curry cut small pieces.png': require('../assets/images/Product images/chicken/Chicken curry cut small pieces.png'),
    '/assets/images/Product images/chicken/chicken curry cuts large pieces.png': require('../assets/images/Product images/chicken/chicken curry cuts large pieces.png'),
    '/assets/images/Product images/chicken/Boneless Cubes.png': require('../assets/images/Product images/chicken/Boneless Cubes.png'),
    '/assets/images/Product images/chicken/country chicken.png': require('../assets/images/Product images/chicken/country chicken.png'),
    '/assets/images/Product images/chicken/Drumsticks.png': require('../assets/images/Product images/chicken/Drumsticks.png'),
    '/assets/images/Product images/chicken/Gravy cut.webp': require('../assets/images/Product images/chicken/Gravy cut.webp'),
    '/assets/images/Product images/chicken/chicken keema.png': require('../assets/images/Product images/chicken/chicken keema.png'),
    '/assets/images/Product images/chicken/chicken lollipop.png': require('../assets/images/Product images/chicken/chicken lollipop.png'),
    '/assets/images/Product images/chicken/quail egg.png': require('../assets/images/Product images/chicken/quail egg.png'),
    '/assets/images/Product images/chicken/Raw Whole Chicken.png': require('../assets/images/Product images/chicken/Raw Whole Chicken.png'),
    '/assets/images/Product images/chicken/white egg.png': require('../assets/images/Product images/chicken/white egg.png'),
    '/assets/images/Category images/chicken.avif': require('../assets/images/Category images/chicken.avif'),
    '/assets/images/Category images/quail.png': require('../assets/images/Category images/quail.png'),
};

/**
 * Resolve product image URL — supports both remote HTTP URLs (Firebase Storage)
 * and local web relative paths (/assets/images/...).
 */
export function getProductImageSource(imageURL?: string | null): ImageSourcePropType {
    if (!imageURL) return FALLBACK_IMAGE;

    // Remote HTTP/HTTPS URL
    if (imageURL.startsWith('http://') || imageURL.startsWith('https://')) {
        return { uri: imageURL };
    }

    // Local static web relative asset path
    const local = PRODUCT_IMAGE_MAP[imageURL];
    if (local) return local;

    // Match by basename if exact key not found
    for (const [key, value] of Object.entries(PRODUCT_IMAGE_MAP)) {
        if (imageURL.toLowerCase().includes(key.split('/').pop()?.toLowerCase() ?? '___never___')) {
            return value;
        }
    }

    return FALLBACK_IMAGE;
}
