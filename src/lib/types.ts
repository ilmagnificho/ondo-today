// Weather condition types for the Ondo weather service
export type WeatherCondition = 'sunny' | 'rain' | 'night';

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
}

// Weather visuals mapping
export const WEATHER_VISUALS: Record<WeatherCondition, WeatherVisuals> = {
  sunny: {
    lightIntensity: 1.0,
    ambientColor: '#FFE4B5', // Warm golden
    particleEffect: false,
    buildingEmission: false,
    streetLights: false,
    rainIntensity: 0,
  },
  rain: {
    lightIntensity: 0.5,
    ambientColor: '#708090', // Slate gray
    particleEffect: true,
    buildingEmission: false,
    streetLights: false,
    rainIntensity: 0.8,
  },
  night: {
    lightIntensity: 0.3,
    ambientColor: '#1a1a2e', // Dark blue
    particleEffect: false,
    buildingEmission: true,  // Windows light up
    streetLights: true,      // Street lamps on
    rainIntensity: 0,
  },
};

