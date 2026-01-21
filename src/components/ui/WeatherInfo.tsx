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
                    border border-white/30 
                    rounded-3xl 
                    px-6 py-5
                    shadow-[0_8px_32px_rgba(0,0,0,0.1)] 
                    min-w-[180px]
                    transition-all duration-300
                ">
                    {/* Show loading only if no data has ever been loaded */}
                    {isLoading && !formattedDate ? (
                        <LoadingState />
                    ) : (
                        <div className="flex flex-col gap-1">
                            {/* Location */}
                            <div className="flex items-center gap-2">
                                <span className="text-white/90 text-sm font-semibold tracking-wide drop-shadow-sm">
                                    {location.name}
                                </span>
                                {viewingHourOffset > 0 && (
                                    <span className="text-amber-400 text-[10px] font-bold px-2 py-0.5 bg-amber-950/40 border border-amber-500/30 rounded-full">
                                        +{viewingHourOffset}h
                                    </span>
                                )}
                            </div>

                            {/* Temperature */}
                            <div className="flex items-start gap-3 mt-2">
                                <span className="text-7xl font-light text-white tracking-tighter leading-none drop-shadow-xl filter">
                                    {displayWeather.temperature}°
                                </span>
                            </div>

                            {/* Condition */}
                            <div className="flex items-center gap-2 mt-2">
                                <ConditionIcon
                                    condition={displayWeather.condition}
                                    isDay={displayWeather.isDay}
                                />
                                <span className="text-white/80 text-sm font-medium">
                                    {displayWeather.conditionText || CONDITION_LABELS[displayWeather.condition]}
                                </span>
                            </div>

                            {/* Date */}
                            <div className="text-white/50 text-xs mt-2 font-medium">
                                {formattedDate}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Details Card - Top Right */}
            <div className="absolute top-8 right-6 z-50 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                <div className="
                        backdrop-blur-2xl bg-white/10 
                        border border-white/30 
                        rounded-2xl 
                        px-5 py-4
                        shadow-[0_8px_32px_rgba(0,0,0,0.1)]
                    ">
                    <div className="flex gap-6 text-xs text-white/60"> {/* Increased gap */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-white/90 text-sm font-medium">{weather.feelsLike}°</span> {/* Bolder */}
                            <span>체감</span>
                        </div>
                        <div className="w-px bg-white/10 h-8 self-center" />
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-white/90 text-sm font-medium">{weather.humidity}%</span>
                            <span>습도</span>
                        </div>
                        <div className="w-px bg-white/10 h-8 self-center" />
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-white/90 text-sm font-medium">{Math.round(weather.windKph)}</span>
                            <span>풍속</span>
                        </div>
                    </div>
                </div>
            </div>
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
