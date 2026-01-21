// Weather API configuration for WeatherAPI.com
export const WEATHER_API_KEY = 'd7d40b21cfa94ff481014331262101';
export const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

// API response types
export interface WeatherAPIResponse {
    location: {
        name: string;
        region: string;
        country: string;
        localtime: string;
    };
    current: {
        temp_c: number;
        temp_f: number;
        is_day: number;
        condition: {
            text: string;
            icon: string;
            code: number;
        };
        humidity: number;
        feelslike_c: number;
        feelslike_f: number;
    };
}

// Weather condition codes that indicate rain
const RAIN_CODES = [
    1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201,
    1240, 1243, 1246, 1273, 1276
];

// Weather condition codes that indicate snow
const SNOW_CODES = [
    1066, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261,
    1264, 1279, 1282
];

// Weather condition codes that indicate cloudy/overcast
const CLOUDY_CODES = [1006, 1009, 1030, 1135, 1147];

import { WeatherCondition } from './types';

/**
 * Map WeatherAPI condition code to our weather conditions
 */
export function mapWeatherCondition(code: number, isDay: number): WeatherCondition {
    // Night time
    if (isDay === 0) {
        return 'night';
    }

    // Rain conditions
    if (RAIN_CODES.includes(code)) {
        return 'rain';
    }

    // Default to sunny for clear/partly cloudy during day
    return 'sunny';
}

/**
 * Fetch current weather for a location
 */
export async function fetchWeather(location: string = 'Seoul'): Promise<WeatherAPIResponse> {
    const url = `${WEATHER_API_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&aqi=no`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
    }

    return response.json();
}
