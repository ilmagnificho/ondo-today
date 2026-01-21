import { NextResponse } from 'next/server';

/**
 * Weather API Route Handler v2
 * 
 * Features:
 * - Real-time weather data
 * - Air Quality Index (AQI) for Namsan Signal
 * - 24-hour forecast for Time Travel slider
 */

const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'd7d40b21cfa94ff481014331262101';
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

// Weather condition type
type WeatherCondition = 'clear' | 'clouds' | 'rain' | 'snow' | 'atmosphere';

// Map condition codes to internal states
function mapConditionCode(code: number): WeatherCondition {
    if ([1000].includes(code)) return 'clear';
    if ([1003, 1006, 1009].includes(code)) return 'clouds';
    if ([1063, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246, 1273, 1276].includes(code)) return 'rain';
    if ([1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282].includes(code)) return 'snow';
    if ([1030, 1135, 1147].includes(code)) return 'atmosphere';
    return 'clouds';
}

// Calculate sun position and phase from hour
function calculateSunData(hour: number): {
    position: number;
    phase: 'night' | 'dawn' | 'day' | 'dusk';
} {
    const totalMinutes = hour * 60;
    const sunriseMinutes = 6 * 60;
    const sunsetMinutes = 18 * 60;
    const dayDuration = sunsetMinutes - sunriseMinutes;

    let position: number;
    let phase: 'night' | 'dawn' | 'day' | 'dusk';

    if (totalMinutes < sunriseMinutes - 60) {
        position = 0;
        phase = 'night';
    } else if (totalMinutes < sunriseMinutes + 60) {
        position = ((totalMinutes - (sunriseMinutes - 60)) / 120) * 20;
        phase = 'dawn';
    } else if (totalMinutes < sunsetMinutes - 60) {
        const dayProgress = (totalMinutes - sunriseMinutes) / dayDuration;
        position = 20 + dayProgress * 60;
        phase = 'day';
    } else if (totalMinutes < sunsetMinutes + 60) {
        position = 80 + ((totalMinutes - (sunsetMinutes - 60)) / 120) * 20;
        phase = 'dusk';
    } else {
        position = 100;
        phase = 'night';
    }

    return { position: Math.min(100, Math.max(0, position)), phase };
}

// Map WeatherAPI AQI (EPA index 1-6) to our color system
function mapAqiLevel(aqiIndex: number): {
    level: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
    color: string;
    label: string;
} {
    switch (aqiIndex) {
        case 1:
            return { level: 'good', color: '#3b82f6', label: '좋음' };
        case 2:
            return { level: 'moderate', color: '#22c55e', label: '보통' };
        case 3:
        case 4:
            return { level: 'unhealthy', color: '#f97316', label: '나쁨' };
        case 5:
        case 6:
        default:
            return { level: 'hazardous', color: '#ef4444', label: '매우 나쁨' };
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location') || 'Seoul';

    try {
        // Fetch forecast with AQI data (days=3 for secure 24h+ coverage)
        const response = await fetch(
            `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=3&aqi=yes`,
            { next: { revalidate: 300 } }
        );

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`[API] Forecast fetched. Days: ${data.forecast.forecastday.length}`);

        // Parse current time
        const localtime = new Date(data.location.localtime);
        const currentHour = localtime.getHours();
        const currentSunData = calculateSunData(currentHour);

        // Extract 48-hour forecast starting from current hour
        const allHours = [
            ...(data.forecast.forecastday[0]?.hour || []),
            ...(data.forecast.forecastday[1]?.hour || []),
            ...(data.forecast.forecastday[2]?.hour || []),
        ];

        const currentHourIndex = allHours.findIndex((h: { time: string }) => {
            const hourTime = new Date(h.time);
            return hourTime >= localtime;
        });

        // Slice next 24 hours
        const next24Hours = allHours.slice(
            Math.max(0, currentHourIndex),
            Math.max(0, currentHourIndex) + 24
        ).map((h: {
            time: string;
            temp_c: number;
            condition: { code: number; text: string };
            is_day: number;
            chance_of_rain: number;
            chance_of_snow: number;
            humidity: number;
            wind_kph: number;
            feelslike_c: number;
        }) => {
            const hourDate = new Date(h.time);
            const hour = hourDate.getHours();
            const sunData = calculateSunData(hour);

            return {
                time: h.time,
                hour,
                temp: Math.round(h.temp_c),
                condition: mapConditionCode(h.condition.code),
                conditionText: h.condition.text,
                isDay: h.is_day === 1,
                chanceOfRain: h.chance_of_rain,
                chanceOfSnow: h.chance_of_snow,
                humidity: h.humidity,
                windKph: h.wind_kph,
                feelsLike: h.feelslike_c,
                sun: sunData,
            };
        });

        // AQI data
        const aqiRaw = data.current.air_quality?.['us-epa-index'] || 1;
        const aqiData = mapAqiLevel(aqiRaw);

        return NextResponse.json({
            success: true,
            data: {
                location: {
                    name: data.location.name,
                    country: data.location.country,
                    localtime: data.location.localtime,
                    timezone: data.location.tz_id,
                },
                current: {
                    temperature: Math.round(data.current.temp_c),
                    feelsLike: Math.round(data.current.feelslike_c),
                    condition: mapConditionCode(data.current.condition.code),
                    conditionText: data.current.condition.text,
                    isDay: data.current.is_day === 1,
                    humidity: data.current.humidity,
                    windKph: data.current.wind_kph,
                },
                sun: {
                    position: currentSunData.position,
                    phase: currentSunData.phase,
                    hour: currentHour,
                },
                aqi: {
                    index: aqiRaw,
                    ...aqiData,
                },
                forecast: next24Hours,
            },
        });
    } catch (error) {
        console.error('Weather API error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to fetch weather' },
            { status: 500 }
        );
    }
}
