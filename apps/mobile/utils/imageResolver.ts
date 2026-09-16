import { ImageSourcePropType } from 'react-native';
import { CloudinaryImages } from '../constants/CloudinaryImages';

const FALLBACK_IMAGE: ImageSourcePropType = { uri: CloudinaryImages.curryCuts };

const PRODUCT_IMAGE_MAP: Record<string, ImageSourcePropType> = {
    '/assets/images/Product images/chicken/Chicken Breasts.png': { uri: CloudinaryImages.chickenBreasts },
    '/assets/images/Product images/chicken/Curry Cuts.png': { uri: CloudinaryImages.curryCuts },
    '/assets/images/Product images/chicken/Leg piece.png': { uri: CloudinaryImages.legPiece },
    '/assets/images/Product images/chicken/Chicken Wings.png': { uri: CloudinaryImages.chickenWings },
    '/assets/images/Product images/Quail/quail.webp': { uri: CloudinaryImages.quailMeat },
    '/assets/images/Product images/chicken/chicken boneless.png': { uri: CloudinaryImages.chickenBoneless },
    '/assets/images/Product images/chicken/Briyani cut.webp': { uri: CloudinaryImages.biryaniCut },
    '/assets/images/Product images/chicken/Chicken curry cut small pieces.png': { uri: CloudinaryImages.curryCutSmall },
    '/assets/images/Product images/chicken/chicken curry cuts large pieces.png': { uri: CloudinaryImages.curryCutLarge },
    '/assets/images/Product images/chicken/Boneless Cubes.png': { uri: CloudinaryImages.bonelessCubes },
    '/assets/images/Product images/chicken/country chicken.png': { uri: CloudinaryImages.countryChicken },
    '/assets/images/Product images/chicken/Drumsticks.png': { uri: CloudinaryImages.drumsticks },
    '/assets/images/Product images/chicken/Gravy cut.webp': { uri: CloudinaryImages.gravyCut },
    '/assets/images/Product images/chicken/chicken keema.png': { uri: CloudinaryImages.chickenKeema },
    '/assets/images/Product images/chicken/chicken lollipop.png': { uri: CloudinaryImages.chickenLollipop },
    '/assets/images/Product images/chicken/quail egg.png': { uri: CloudinaryImages.quailEgg },
    '/assets/images/Product images/chicken/Raw Whole Chicken.png': { uri: CloudinaryImages.rawWholeChicken },
    '/assets/images/Product images/chicken/white egg.png': { uri: CloudinaryImages.whiteEgg },
    '/assets/images/Category images/chicken.avif': { uri: CloudinaryImages.categoryChicken },
    '/assets/images/Category images/quail.png': { uri: CloudinaryImages.categoryKadai },
};

/**
 * Resolve product image URL — supports remote HTTP URLs (Cloudinary CDN / Firebase Storage),
 * static web relative asset paths (/assets/images/...), and product name keyword matching.
 */
export function getProductImageSource(imageURL?: string | null, meatName?: string): ImageSourcePropType {
    const searchTarget = `${imageURL ?? ''} ${meatName ?? ''}`.toLowerCase().trim();
    if (!searchTarget) return FALLBACK_IMAGE;

    // Remote HTTP/HTTPS URL (Cloudinary CDN or external)
    if (imageURL && (imageURL.startsWith('http://') || imageURL.startsWith('https://'))) {
        return { uri: imageURL };
    }

    // Exact match in map
    if (imageURL && PRODUCT_IMAGE_MAP[imageURL]) {
        return PRODUCT_IMAGE_MAP[imageURL];
    }

    // Smart semantic keyword matching for cuts & meats
    if (searchTarget.includes('biriyani') || searchTarget.includes('briyani')) {
        return { uri: CloudinaryImages.biryaniCut };
    }
    if (searchTarget.includes('breast')) {
        return { uri: CloudinaryImages.chickenBreasts };
    }
    if (searchTarget.includes('boneless cube') || searchTarget.includes('cubes')) {
        return { uri: CloudinaryImages.bonelessCubes };
    }
    if (searchTarget.includes('boneless')) {
        return { uri: CloudinaryImages.chickenBoneless };
    }
    if (searchTarget.includes('drumstick')) {
        return { uri: CloudinaryImages.drumsticks };
    }
    if (searchTarget.includes('leg')) {
        return { uri: CloudinaryImages.legPiece };
    }
    if (searchTarget.includes('wing')) {
        return { uri: CloudinaryImages.chickenWings };
    }
    if (searchTarget.includes('lollipop')) {
        return { uri: CloudinaryImages.chickenLollipop };
    }
    if (searchTarget.includes('keema')) {
        return { uri: CloudinaryImages.chickenKeema };
    }
    if (searchTarget.includes('country') || searchTarget.includes('naatu')) {
        return { uri: CloudinaryImages.countryChicken };
    }
    if (searchTarget.includes('gravy')) {
        return { uri: CloudinaryImages.gravyCut };
    }
    if (searchTarget.includes('quail egg')) {
        return { uri: CloudinaryImages.quailEgg };
    }
    if (searchTarget.includes('egg')) {
        return { uri: CloudinaryImages.whiteEgg };
    }
    if (searchTarget.includes('quail') || searchTarget.includes('kaada')) {
        return { uri: CloudinaryImages.quailMeat };
    }
    if (searchTarget.includes('whole')) {
        return { uri: CloudinaryImages.rawWholeChicken };
    }
    if (searchTarget.includes('small pieces') || searchTarget.includes('curry cut small')) {
        return { uri: CloudinaryImages.curryCutSmall };
    }
    if (searchTarget.includes('large pieces') || searchTarget.includes('curry cut large')) {
        return { uri: CloudinaryImages.curryCutLarge };
    }
    if (searchTarget.includes('curry')) {
        return { uri: CloudinaryImages.curryCuts };
    }

    // Match by basename if exact key not found
    for (const [key, value] of Object.entries(PRODUCT_IMAGE_MAP)) {
        if (searchTarget.includes(key.split('/').pop()?.toLowerCase() ?? '___never___')) {
            return value;
        }
    }

    return FALLBACK_IMAGE;
}
