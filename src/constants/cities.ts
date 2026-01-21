/**
 * City Configuration for Ondo City
 * 
 * This file maps city identifiers to their Spline 3D model URLs
 * and contains metadata for each supported city.
 * 
 * Phase 1: Seoul MVP
 * Phase 2: Tokyo, New York, Paris, London
 */

export interface CityConfig {
    id: string;
    name: string;
    nameKo: string;
    country: string;
    countryCode: string;
    splineUrl: string;
    landmarks: string[];
    timezone: string;
    // Default camera position for the city view
    cameraPosition?: {
        x: number;
        y: number;
        z: number;
    };
}

/**
 * Supported cities configuration
 * Add new cities here for Phase 2 expansion
 */
export const CITIES: Record<string, CityConfig> = {
    seoul: {
        id: 'seoul',
        name: 'Seoul',
        nameKo: '서울',
        country: 'South Korea',
        countryCode: 'KR',
        // TODO: Replace with actual Seoul Spline model URL
        // For MVP, using a placeholder - user should provide their own Spline scene
        splineUrl: 'https://prod.spline.design/PqMTsgvYN7xGnmmX/scene.splinecode',
        landmarks: ['Namsan Tower', 'Han River', '63 Building', 'Gwanghwamun'],
        timezone: 'Asia/Seoul',
        cameraPosition: { x: 0, y: 100, z: 200 },
    },

    // Phase 2 cities (placeholders)
    tokyo: {
        id: 'tokyo',
        name: 'Tokyo',
        nameKo: '도쿄',
        country: 'Japan',
        countryCode: 'JP',
        splineUrl: '', // To be added
        landmarks: ['Tokyo Tower', 'Skytree', 'Shibuya Crossing'],
        timezone: 'Asia/Tokyo',
    },

    newyork: {
        id: 'newyork',
        name: 'New York',
        nameKo: '뉴욕',
        country: 'USA',
        countryCode: 'US',
        splineUrl: '', // To be added
        landmarks: ['Statue of Liberty', 'Empire State', 'Central Park'],
        timezone: 'America/New_York',
    },

    paris: {
        id: 'paris',
        name: 'Paris',
        nameKo: '파리',
        country: 'France',
        countryCode: 'FR',
        splineUrl: '', // To be added
        landmarks: ['Eiffel Tower', 'Arc de Triomphe', 'Louvre'],
        timezone: 'Europe/Paris',
    },

    london: {
        id: 'london',
        name: 'London',
        nameKo: '런던',
        country: 'UK',
        countryCode: 'GB',
        splineUrl: '', // To be added
        landmarks: ['Big Ben', 'Tower Bridge', 'London Eye'],
        timezone: 'Europe/London',
    },
};

/**
 * Default city for MVP
 * All unmapped locations will fall back to this city
 */
export const DEFAULT_CITY_ID = 'seoul';

/**
 * Get city configuration by ID
 * Falls back to Seoul if city not found
 */
export function getCityConfig(cityId: string): CityConfig {
    const normalizedId = cityId.toLowerCase().replace(/\s+/g, '');
    return CITIES[normalizedId] || CITIES[DEFAULT_CITY_ID];
}

/**
 * Map a location name to a city ID
 * Used to convert Weather API location to our city system
 * 
 * For MVP: Always returns 'seoul' as fallback
 */
export function mapLocationToCity(location: string): string {
    const normalizedLocation = location.toLowerCase().trim();

    // Direct match
    if (CITIES[normalizedLocation]) {
        return normalizedLocation;
    }

    // Partial match checking
    for (const [cityId, config] of Object.entries(CITIES)) {
        if (
            normalizedLocation.includes(cityId) ||
            normalizedLocation.includes(config.name.toLowerCase()) ||
            normalizedLocation.includes(config.nameKo)
        ) {
            return cityId;
        }
    }

    // MVP: Default to Seoul for any unmapped location
    console.log(`Location "${location}" not mapped to any city, defaulting to Seoul`);
    return DEFAULT_CITY_ID;
}

/**
 * Check if a city has a valid Spline URL configured
 */
export function isCityAvailable(cityId: string): boolean {
    const config = getCityConfig(cityId);
    return Boolean(config.splineUrl && config.splineUrl.length > 0);
}

/**
 * Get all available cities (with valid Spline URLs)
 */
export function getAvailableCities(): CityConfig[] {
    return Object.values(CITIES).filter(city => isCityAvailable(city.id));
}
