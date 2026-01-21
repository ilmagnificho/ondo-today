'use client';

import { useWeatherStore } from '@/store/weatherStore';
import { WeatherCondition } from '@/lib/types';
import { Sun, CloudRain, Moon, Cloud, Snowflake, Wind, Bug, RefreshCw, MapPin } from 'lucide-react';
import { useState } from 'react';

// Weather icon mapping
const WeatherIcon = ({ condition, isDay }: { condition: WeatherCondition, isDay: boolean }) => {
    const iconProps = { size: 28, strokeWidth: 1.5 };

    // Handle Night/Day logic visually
    if (!isDay && condition === 'clear') {
        return <Moon {...iconProps} className="text-indigo-300" />;
    }

    switch (condition) {
        case 'clear':
        case 'sunny': // Legacy support
            return <Sun {...iconProps} className="text-yellow-400" />;
        case 'clouds':
            return <Cloud {...iconProps} className="text-gray-300" />;
        case 'rain':
            return <CloudRain {...iconProps} className="text-blue-400" />;
        case 'snow':
            return <Snowflake {...iconProps} className="text-cyan-200" />;
        case 'atmosphere':
        case 'night': // Legacy support (though handled by isDay)
            return <Wind {...iconProps} className="text-slate-400" />;
        default:
            return <Sun {...iconProps} className="text-yellow-400" />;
    }
};

// Weather condition labels in Korean
const CONDITION_LABELS: Record<WeatherCondition, string> = {
    clear: '맑음',
    clouds: '흐림',
    rain: '비',
    snow: '눈',
    atmosphere: '안개/먼지',
    sunny: '맑음',
    night: '밤',
};

export default function WeatherOverlay() {
    const {
        weather,
        location, // Add location here
        isDebugMode,
        isLoading,
        error,
        toggleDebugMode,
        setCondition,
        fetchWeather
    } = useWeatherStore();

    const [locationInput, setLocationInput] = useState('');

    // Handle location search
    const handleLocationSearch = () => {
        if (locationInput.trim()) {
            // Use fetchWeather type-casted to allow string arg if the store signature supports it
            // Based on store definition: fetchWeather: (city?: string) => Promise<void>
            fetchWeather(locationInput.trim());
            setLocationInput('');
        }
    };

    // Filter relevant conditions for debug buttons (exclude legacy/duplicate)
    const DEBUG_CONDITIONS: WeatherCondition[] = ['clear', 'clouds', 'rain', 'snow', 'atmosphere'];

    return (
        <>
            {/* Main Weather Card - Glassmorphism */}
            <div className="absolute top-6 left-6 z-10">
                <div className="glass-card px-6 py-4 rounded-2xl">
                    {isLoading ? (
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/50 border-t-white"></div>
                            <span className="text-white/70">Loading weather...</span>
                        </div>
                    ) : error ? (
                        <div className="text-red-300 text-sm">{error}</div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <WeatherIcon condition={weather.condition} isDay={weather.isDay !== undefined ? weather.isDay : true} />
                            <div>
                                <h2 className="text-lg font-semibold text-white/90 flex items-center gap-1">
                                    <MapPin size={14} className="text-white/60" />
                                    {location.name || 'Unknown Location'}
                                </h2>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-light text-white">
                                        {weather.temperature}°C
                                    </span>
                                    <span className="text-sm text-white/60">
                                        {weather.conditionText || CONDITION_LABELS[weather.condition]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Refresh Button */}
            <button
                onClick={() => fetchWeather(location.name)}
                disabled={isLoading}
                className="absolute top-6 right-20 z-10 glass-button p-3 rounded-full 
                   hover:bg-white/20 transition-all duration-300 disabled:opacity-50"
                title="Refresh Weather"
            >
                <RefreshCw size={20} className={`text-white/60 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Debug Mode Toggle Button */}
            <button
                onClick={toggleDebugMode}
                className="absolute bottom-6 right-6 z-10 glass-button p-3 rounded-full 
                   hover:bg-white/20 transition-all duration-300"
                title="Toggle Debug Mode"
            >
                <Bug size={20} className={isDebugMode ? 'text-green-400' : 'text-white/60'} />
            </button>

            {/* Debug Panel */}
            {isDebugMode && (
                <div className="absolute bottom-20 right-6 z-10 glass-card px-4 py-3 rounded-xl">
                    <p className="text-xs text-white/60 mb-2 font-medium">Debug Mode</p>

                    {/* Location Search */}
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                            placeholder="Enter city..."
                            className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm 
                         border border-white/20 placeholder-white/40 focus:outline-none 
                         focus:border-white/40 w-32"
                        />
                        <button
                            onClick={handleLocationSearch}
                            className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm 
                         hover:bg-white/30 transition-all"
                        >
                            Search
                        </button>
                    </div>

                    {/* Weather Condition Buttons */}
                    <div className="flex gap-2 flex-wrap max-w-[200px] justify-end">
                        {DEBUG_CONDITIONS.map((condition) => (
                            <button
                                key={condition}
                                onClick={() => setCondition(condition)}
                                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all
                  ${weather.condition === condition
                                        ? 'bg-white/30 text-white'
                                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                                    }`}
                            >
                                {CONDITION_LABELS[condition]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Brand Logo */}
            <div className="absolute bottom-6 left-6 z-10">
                <h1 className="text-2xl font-bold text-white/90 tracking-tight">
                    Ondo
                    <span className="text-sm font-normal text-white/50 ml-2">온도</span>
                </h1>
            </div>
        </>
    );
}
