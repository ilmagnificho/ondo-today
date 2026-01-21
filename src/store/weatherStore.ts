import { create } from 'zustand';

/**
 * Weather Store v2 - Living Diorama with Time Travel
 * 
 * Features:
 * - Real-time weather data
 * - AQI (Air Quality Index) for Namsan Signal
 * - 24-hour forecast for Time Travel slider
 * - viewingTime state separate from realTime
 */

// Types
export type WeatherCondition = 'clear' | 'clouds' | 'rain' | 'snow' | 'atmosphere';
export type TimePhase = 'night' | 'dawn' | 'day' | 'dusk';
export type AqiLevel = 'good' | 'moderate' | 'unhealthy' | 'hazardous';

// Hourly forecast item
export interface HourlyForecast {
    time: string;
    hour: number;
    temp: number;
    condition: WeatherCondition;
    conditionText: string;
    isDay: boolean;
    chanceOfRain: number;
    chanceOfSnow: number;
    sun: {
        position: number;
        phase: TimePhase;
    };
}

// AQI data
export interface AqiData {
    index: number;
    level: AqiLevel;
    color: string;
    label: string;
}

// Weather data
export interface WeatherData {
    temperature: number;
    feelsLike: number;
    condition: WeatherCondition;
    conditionText: string;
    isDay: boolean;
    humidity: number;
    windKph: number;
}

// Location data
export interface LocationData {
    name: string;
    country: string;
    localtime: string;
    timezone: string;
}

// Sun data
export interface SunData {
    position: number;
    phase: TimePhase;
    hour: number;
}

// Store state interface
interface WeatherStore {
    // Real-time data
    weather: WeatherData;
    location: LocationData;
    sun: SunData;
    aqi: AqiData;
    forecast: HourlyForecast[];

    // Time Travel feature
    viewingHourOffset: number;  // 0 = now, 1 = +1hr, etc.
    viewingData: {
        weather: WeatherData;
        sun: SunData;
    };

    // UI State
    isLoading: boolean;
    isDebugMode: boolean;
    error: string | null;
    lastUpdated: Date | null;

    // Actions
    setLoading: (isLoading: boolean) => void;
    toggleDebugMode: () => void;
    fetchWeather: (city?: string) => Promise<void>;

    // Time Travel actions
    setViewingHourOffset: (offset: number) => void;

    // Debug actions
    setTimePhase: (phase: TimePhase) => void;
    setCondition: (condition: WeatherCondition) => void;
}

// Defaults
const DEFAULT_WEATHER: WeatherData = {
    temperature: 0,
    feelsLike: 0,
    condition: 'clear',
    conditionText: 'Clear',
    isDay: true,
    humidity: 50,
    windKph: 10,
};

const DEFAULT_LOCATION: LocationData = {
    name: 'Seoul',
    country: 'South Korea',
    localtime: new Date().toISOString(),
    timezone: 'Asia/Seoul',
};

const DEFAULT_SUN: SunData = {
    position: 50,
    phase: 'day',
    hour: 12,
};

const DEFAULT_AQI: AqiData = {
    index: 1,
    level: 'good',
    color: '#3b82f6',
    label: '좋음',
};

// Create store
export const useWeatherStore = create<WeatherStore>((set, get) => ({
    weather: DEFAULT_WEATHER,
    location: DEFAULT_LOCATION,
    sun: DEFAULT_SUN,
    aqi: DEFAULT_AQI,
    forecast: [],
    viewingHourOffset: 0,
    viewingData: {
        weather: DEFAULT_WEATHER,
        sun: DEFAULT_SUN,
    },
    isLoading: true,
    isDebugMode: false,
    error: null,
    lastUpdated: null,

    setLoading: (isLoading) => set({ isLoading }),
    toggleDebugMode: () => set((state) => ({ isDebugMode: !state.isDebugMode })),

    fetchWeather: async (city = 'Seoul') => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`/api/weather?location=${encodeURIComponent(city)}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch weather');
            }

            const { data } = result;

            const weatherData: WeatherData = {
                temperature: data.current.temperature,
                feelsLike: data.current.feelsLike,
                condition: data.current.condition,
                conditionText: data.current.conditionText,
                isDay: data.current.isDay,
                humidity: data.current.humidity,
                windKph: data.current.windKph,
            };

            set({
                weather: weatherData,
                location: {
                    name: data.location.name,
                    country: data.location.country,
                    localtime: data.location.localtime,
                    timezone: data.location.timezone,
                },
                sun: {
                    position: data.sun.position,
                    phase: data.sun.phase,
                    hour: data.sun.hour,
                },
                aqi: data.aqi,
                forecast: data.forecast,
                viewingHourOffset: 0,
                viewingData: {
                    weather: weatherData,
                    sun: data.sun,
                },
                isLoading: false,
                lastUpdated: new Date(),
            });
        } catch (error) {
            console.error('Weather fetch error:', error);
            set({
                error: error instanceof Error ? error.message : 'Unknown error',
                isLoading: false,
            });
        }
    },

    // Time Travel: Update viewing data based on offset
    setViewingHourOffset: (offset: number) => {
        const { forecast, weather, sun } = get();

        if (offset === 0 || forecast.length === 0) {
            set({
                viewingHourOffset: 0,
                viewingData: { weather, sun },
            });
            return;
        }

        const clampedOffset = Math.min(Math.max(0, offset), forecast.length - 1);
        const forecastItem = forecast[clampedOffset];

        if (forecastItem) {
            set({
                viewingHourOffset: clampedOffset,
                viewingData: {
                    weather: {
                        ...weather,
                        temperature: forecastItem.temp,
                        condition: forecastItem.condition,
                        conditionText: forecastItem.conditionText,
                        isDay: forecastItem.isDay,
                    },
                    sun: {
                        position: forecastItem.sun.position,
                        phase: forecastItem.sun.phase,
                        hour: forecastItem.hour,
                    },
                },
            });
        }
    },

    // Debug actions
    setTimePhase: (phase) => {
        const phaseData: Record<TimePhase, { position: number; hour: number }> = {
            night: { position: 0, hour: 2 },
            dawn: { position: 15, hour: 6 },
            day: { position: 50, hour: 12 },
            dusk: { position: 85, hour: 18 },
        };

        const { position, hour } = phaseData[phase];
        set((state) => ({
            viewingData: {
                ...state.viewingData,
                sun: { phase, position, hour },
            },
        }));
    },

    setCondition: (condition) => {
        set((state) => ({
            viewingData: {
                ...state.viewingData,
                weather: {
                    ...state.viewingData.weather,
                    condition,
                    conditionText: condition.charAt(0).toUpperCase() + condition.slice(1),
                },
            },
        }));
    },
}));

// Helper: Format date
export function getFormattedDate(localtime: string): string {
    const date = new Date(localtime);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
}

// Helper: Get sky gradient
export function getSkyGradient(phase: TimePhase): string {
    switch (phase) {
        case 'night':
            return 'linear-gradient(to bottom, #0f0c29 0%, #302b63 50%, #24243e 100%)';
        case 'dawn':
            return 'linear-gradient(to bottom, #0f0c29 0%, #ff6b6b 30%, #feca57 60%, #48dbfb 100%)';
        case 'day':
            return 'linear-gradient(to bottom, #74b9ff 0%, #81ecec 50%, #dfe6e9 100%)';
        case 'dusk':
            return 'linear-gradient(to bottom, #6c5ce7 0%, #fd79a8 30%, #fdcb6e 60%, #2d3436 100%)';
    }
}

// Helper: Get orb (sun/moon) style
export function getOrbStyle(phase: TimePhase): {
    color: string;
    glow: string;
    size: number;
} {
    const isMoon = phase === 'night';
    return {
        color: isMoon ? '#f5f6fa' : '#ffeaa7',
        glow: isMoon
            ? '0 0 60px 20px rgba(255,255,255,0.3)'
            : '0 0 80px 30px rgba(255,214,10,0.5)',
        size: isMoon ? 50 : 70,
    };
}
