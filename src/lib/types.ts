// Weather condition types for the Ondo weather service
// Syncing with weatherStore.ts types + legacy types
export type WeatherCondition =
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'snow'
  | 'atmosphere'
  | 'sunny' // Legacy support
  | 'night'; // Legacy support

// Weather data structure
export interface WeatherData {
  condition: WeatherCondition;
  temperature: number;
  location: string;
  description: string;
}

// City configuration type
export interface CityConfig {
  id: string;
  name: string;
  nameKo: string;
  country: string;
  countryCode: string;
  splineUrl: string;
  landmarks: string[];
  timezone: string;
  cameraPosition?: {
    x: number;
    y: number;
    z: number;
  };
}

// Spline scene configuration (legacy - kept for compatibility)
export interface SplineConfig {
  sceneUrl: string;
  isLoaded: boolean;
}

// Weather-to-visual mapping configuration
export interface WeatherVisuals {
  lightIntensity: number;
  ambientColor: string;
  particleEffect: boolean;
  // City-scale effects
  buildingEmission?: boolean;  // For night mode - windows glow
  streetLights?: boolean;      // For night mode
  rainIntensity?: number;      // 0-1 scale for rain
  snowIntensity?: number;      // 0-1 scale for snow
}

// Weather visuals mapping
export const WEATHER_VISUALS: Record<WeatherCondition, WeatherVisuals> = {
  // Main types
  clear: {
    lightIntensity: 1.0,
    ambientColor: '#FFE4B5',
    particleEffect: false,
    rainIntensity: 0,
  },
  clouds: {
    lightIntensity: 0.7,
    ambientColor: '#d1d8e0', // Light gray
    particleEffect: false,
    rainIntensity: 0,
  },
  rain: {
    lightIntensity: 0.5,
    ambientColor: '#708090',
    particleEffect: true,
    rainIntensity: 0.8,
  },
  snow: {
    lightIntensity: 0.8, // Snow reflects light
    ambientColor: '#f1f2f6', // White-ish
    particleEffect: true,
    rainIntensity: 0,
    snowIntensity: 0.7,
  },
  atmosphere: {
    lightIntensity: 0.5,
    ambientColor: '#a5b1c2', // Hazy
    particleEffect: false,
    rainIntensity: 0,
  },

  // Legacy / Alias mapping
  sunny: {
    lightIntensity: 1.0,
    ambientColor: '#FFE4B5',
    particleEffect: false,
    rainIntensity: 0,
  },
  night: {
    lightIntensity: 0.3,
    ambientColor: '#1a1a2e',
    particleEffect: false,
    buildingEmission: true,
    streetLights: true,
    rainIntensity: 0,
  },
};
