'use client';

import { useWeatherStore, getFormattedDate, WeatherCondition } from '@/store/weatherStore';
import { Sun, CloudRain, Moon, Cloud, Snowflake, Wind } from 'lucide-react';

/**
 * WeatherInfo - Apple Weather-inspired Minimalist UI
 * Uses viewingData for Time Travel compatibility
 */

function ConditionIcon({ condition, isDay }: { condition: WeatherCondition; isDay: boolean }) {
    const props = { size: 28, strokeWidth: 1.5 };

    switch (condition) {
        case 'clear':
            return isDay
                ? <Sun {...props} className="text-amber-400" />
                : <Moon {...props} className="text-indigo-200" />;
        case 'clouds':
            return <Cloud {...props} className="text-slate-300" />;
        case 'rain':
            return <CloudRain {...props} className="text-blue-300" />;
        case 'snow':
            return <Snowflake {...props} className="text-white" />;
        case 'atmosphere':
            return <Wind {...props} className="text-slate-400" />;
        default:
            return <Sun {...props} className="text-amber-400" />;
    }
}

const CONDITION_LABELS: Record<WeatherCondition, string> = {
    clear: '맑음',
    clouds: '흐림',
    rain: '비',
    snow: '눈',
    atmosphere: '안개',
    sunny: '맑음',
    night: '밤',
};

export default function WeatherInfo() {
    const { viewingData, location, weather, isLoading, viewingHourOffset } = useWeatherStore();

    // Use viewingData for Time Travel, but show real feelsLike/humidity/wind
    const displayWeather = viewingData.weather;
    const formattedDate = getFormattedDate(location.localtime);

    return (
        <>
            <>
                {/* Main Weather Info - Invisible Header Concept */}
                <div className="absolute top-10 left-6 z-50 animate-fadeIn">
                    <div className="flex flex-col gap-0.5">
                        {/* Location - Text Only with Shadow */}
                        <div className="flex items-center gap-2">
                            <span className="text-white text-lg font-bold tracking-tight drop-shadow-md">
                                {location.name}
                            </span>
                            {viewingHourOffset > 0 && (
                                <span className="text-amber-300 text-[10px] font-bold px-2 py-0.5 bg-black/40 backdrop-blur-md rounded-full border border-amber-500/30">
                                    +{viewingHourOffset}h
                                </span>
                            )}
                        </div>

                        {/* Temperature & Condition - Invisible Container */}
                        <div className="flex items-end gap-3 mt-1">
                            <span className="text-8xl font-bold text-white tracking-tighter leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                                {displayWeather.temperature}°
                            </span>
                            <div className="flex flex-col mb-3">
                                <ConditionIcon
                                    condition={displayWeather.condition}
                                    isDay={displayWeather.isDay}
                                />
                                <span className="text-white/90 text-sm font-medium drop-shadow-sm mt-1">
                                    {displayWeather.conditionText || CONDITION_LABELS[displayWeather.condition]}
                                </span>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="text-white/60 text-xs mt-1 font-medium drop-shadow-sm ml-1">
                            {formattedDate}
                        </div>
                    </div>
                </div>

                {/* Details Pills - Top Right (Stacked Vertical) */}
                <div className="absolute top-10 right-6 z-50 flex flex-col gap-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-sm ml-auto">
                        <span className="text-white/50 text-[10px] uppercase font-bold">FEELS</span>
                        <span className="text-white text-xs font-semibold">{weather.feelsLike}°</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-sm ml-auto">
                        <span className="text-white/50 text-[10px] uppercase font-bold">HUMIDITY</span>
                        <span className="text-white text-xs font-semibold">{weather.humidity}%</span>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-sm ml-auto">
                        <span className="text-white/50 text-[10px] uppercase font-bold">WIND</span>
                        <span className="text-white text-xs font-semibold">{Math.round(weather.windKph)} <span className="text-[9px] font-normal opacity-70">km/h</span></span>
                    </div>
                </div>
            </>
        </>
    );
}

function LoadingState() {
    return (
        <div className="flex items-center gap-3 py-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-white/50 text-sm">Loading...</span>
        </div>
    );
}
