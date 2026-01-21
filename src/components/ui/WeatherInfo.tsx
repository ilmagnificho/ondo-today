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
            {/* Main Weather Card - Top Left */}
            <div className="absolute top-8 left-6 z-50 animate-fadeIn">
                <div className="
                    backdrop-blur-2xl bg-white/10 
                    border border-white/20 
                    rounded-3xl 
                    px-6 py-5
                    shadow-2xl shadow-black/10
                    min-w-[160px]
                ">
                    {isLoading ? (
                        <LoadingState />
                    ) : (
                        <div className="flex flex-col gap-1">
                            {/* Location */}
                            <div className="flex items-center gap-2">
                                <span className="text-white/80 text-sm font-medium tracking-wide">
                                    {location.name}
                                </span>
                                {viewingHourOffset > 0 && (
                                    <span className="text-amber-400/80 text-xs font-medium px-1.5 py-0.5 bg-amber-500/20 rounded-full">
                                        +{viewingHourOffset}h
                                    </span>
                                )}
                            </div>

                            {/* Temperature */}
                            <div className="flex items-start gap-3 mt-1">
                                <span className="text-5xl font-extralight text-white tracking-tighter leading-none">
                                    {displayWeather.temperature}°
                                </span>
                            </div>

                            {/* Condition */}
                            <div className="flex items-center gap-2 mt-2">
                                <ConditionIcon
                                    condition={displayWeather.condition}
                                    isDay={displayWeather.isDay}
                                />
                                <span className="text-white/70 text-sm">
                                    {displayWeather.conditionText || CONDITION_LABELS[displayWeather.condition]}
                                </span>
                            </div>

                            {/* Date */}
                            <div className="text-white/40 text-xs mt-2 font-light">
                                {formattedDate}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Card - Top Right */}
            {!isLoading && (
                <div className="absolute top-8 right-6 z-50 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <div className="
                        backdrop-blur-xl bg-white/5 
                        border border-white/10 
                        rounded-2xl 
                        px-4 py-3
                        shadow-lg shadow-black/5
                    ">
                        <div className="flex gap-4 text-xs text-white/50">
                            <div className="flex flex-col items-center">
                                <span className="text-white/70 text-sm font-light">{weather.feelsLike}°</span>
                                <span>체감</span>
                            </div>
                            <div className="w-px bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-white/70 text-sm font-light">{weather.humidity}%</span>
                                <span>습도</span>
                            </div>
                            <div className="w-px bg-white/10" />
                            <div className="flex flex-col items-center">
                                <span className="text-white/70 text-sm font-light">{Math.round(weather.windKph)}</span>
                                <span>km/h</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
