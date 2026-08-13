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
 * Resolve product image URL — supports remote HTTP URLs (Firebase Storage),
 * static web relative asset paths (/assets/images/...), and product name keyword matching.
 */
export function getProductImageSource(imageURL?: string | null, meatName?: string): ImageSourcePropType {
    const searchTarget = `${imageURL ?? ''} ${meatName ?? ''}`.toLowerCase().trim();
    if (!searchTarget) return FALLBACK_IMAGE;

    // Remote HTTP/HTTPS URL
    if (imageURL && (imageURL.startsWith('http://') || imageURL.startsWith('https://'))) {
        return { uri: imageURL };
    }

    // Exact match in map
    if (imageURL && PRODUCT_IMAGE_MAP[imageURL]) {
        return PRODUCT_IMAGE_MAP[imageURL];
    }

    // Smart semantic keyword matching for cuts & meats
    if (searchTarget.includes('biriyani') || searchTarget.includes('briyani')) {
        return require('../assets/images/Product images/chicken/Briyani cut.webp');
    }
    if (searchTarget.includes('breast')) {
        return require('../assets/images/Product images/chicken/Chicken Breasts.png');
    }
    if (searchTarget.includes('boneless cube') || searchTarget.includes('cubes')) {
        return require('../assets/images/Product images/chicken/Boneless Cubes.png');
    }
    if (searchTarget.includes('boneless')) {
        return require('../assets/images/Product images/chicken/chicken boneless.png');
    }
    if (searchTarget.includes('drumstick')) {
        return require('../assets/images/Product images/chicken/Drumsticks.png');
    }
    if (searchTarget.includes('leg')) {
        return require('../assets/images/Product images/chicken/Leg piece.png');
    }
    if (searchTarget.includes('wing')) {
        return require('../assets/images/Product images/chicken/Chicken Wings.png');
    }
    if (searchTarget.includes('lollipop')) {
        return require('../assets/images/Product images/chicken/chicken lollipop.png');
    }
    if (searchTarget.includes('keema')) {
        return require('../assets/images/Product images/chicken/chicken keema.png');
    }
    if (searchTarget.includes('country') || searchTarget.includes('naatu')) {
        return require('../assets/images/Product images/chicken/country chicken.png');
    }
    if (searchTarget.includes('gravy')) {
        return require('../assets/images/Product images/chicken/Gravy cut.webp');
    }
    if (searchTarget.includes('quail egg')) {
        return require('../assets/images/Product images/chicken/quail egg.png');
    }
    if (searchTarget.includes('egg')) {
        return require('../assets/images/Product images/chicken/white egg.png');
    }
    if (searchTarget.includes('quail') || searchTarget.includes('kaada')) {
        return require('../assets/images/Product images/Quail/quail.webp');
    }
    if (searchTarget.includes('whole')) {
        return require('../assets/images/Product images/chicken/Raw Whole Chicken.png');
    }
    if (searchTarget.includes('small pieces') || searchTarget.includes('curry cut small')) {
        return require('../assets/images/Product images/chicken/Chicken curry cut small pieces.png');
    }
    if (searchTarget.includes('large pieces') || searchTarget.includes('curry cut large')) {
        return require('../assets/images/Product images/chicken/chicken curry cuts large pieces.png');
    }
    if (searchTarget.includes('curry')) {
        return require('../assets/images/Product images/chicken/Curry Cuts.png');
    }

    // Match by basename if exact key not found
    for (const [key, value] of Object.entries(PRODUCT_IMAGE_MAP)) {
        if (searchTarget.includes(key.split('/').pop()?.toLowerCase() ?? '___never___')) {
            return value;
        }
    }

    return FALLBACK_IMAGE;
}
