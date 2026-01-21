'use client';

import { useMemo, useCallback } from 'react';
import { useWeatherStore } from '@/store/weatherStore';

/**
 * TimeSlider - 24h Forecast Time Travel Component
 * 
 * Allows users to preview weather/lighting for the next 24 hours
 * 
 * Performance Notes:
 * - useMemo for forecast items to prevent re-renders
 * - useCallback for slider change handler
 * - CSS transforms for smooth 60fps animations
 */

export default function TimeSlider() {
    const {
        forecast,
        viewingHourOffset,
        setViewingHourOffset,
        viewingData,
    } = useWeatherStore();

    // Memoize forecast items for performance
    const forecastItems = useMemo(() => {
        return forecast.slice(0, 24).map((item, index) => ({
            index,
            hour: item.hour,
            temp: item.temp,
            label: `${item.hour}:00`,
            isActive: index === viewingHourOffset,
        }));
    }, [forecast, viewingHourOffset]);

    // Optimized slider change handler
    const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setViewingHourOffset(value);
    }, [setViewingHourOffset]);

    // Format current viewing time
    const viewingTimeLabel = useMemo(() => {
        if (viewingHourOffset === 0) return '현재';
        const hours = viewingData.sun.hour;
        return `${hours.toString().padStart(2, '0')}:00`;
    }, [viewingHourOffset, viewingData.sun.hour]);

    if (forecast.length === 0) return null;

    return (
        <div className="absolute bottom-16 left-6 right-6 z-50">
            {/* Glassmorphism Container */}
            <div className="
                backdrop-blur-2xl bg-white/10 
                border border-white/15 
                rounded-2xl 
                px-5 py-4
                shadow-xl shadow-black/10
            ">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-white/50 text-xs font-medium">
                        시간 여행
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium">
                            {viewingTimeLabel}
                        </span>
                        <span className="text-white/60 text-sm">
                            {viewingData.weather.temperature}°
                        </span>
                    </div>
                </div>

                {/* Slider Track */}
                <div className="relative">
                    <input
                        type="range"
                        min="0"
                        max={Math.min(23, forecast.length - 1)}
                        value={viewingHourOffset}
                        onChange={handleSliderChange}
                        className="
                            w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                            [&::-webkit-slider-thumb]:appearance-none
                            [&::-webkit-slider-thumb]:w-5
                            [&::-webkit-slider-thumb]:h-5
                            [&::-webkit-slider-thumb]:rounded-full
                            [&::-webkit-slider-thumb]:bg-white
                            [&::-webkit-slider-thumb]:shadow-lg
                            [&::-webkit-slider-thumb]:cursor-grab
                            [&::-webkit-slider-thumb]:active:cursor-grabbing
                            [&::-webkit-slider-thumb]:transition-transform
                            [&::-webkit-slider-thumb]:hover:scale-110
                            [&::-moz-range-thumb]:w-5
                            [&::-moz-range-thumb]:h-5
                            [&::-moz-range-thumb]:rounded-full
                            [&::-moz-range-thumb]:bg-white
                            [&::-moz-range-thumb]:border-none
                            [&::-moz-range-thumb]:cursor-grab
                        "
                    />
                </div>

                {/* Hour Markers */}
                <div className="flex justify-between mt-2 px-1">
                    {[0, 6, 12, 18, 23].map((marker) => {
                        const item = forecastItems[marker];
                        if (!item) return null;
                        return (
                            <span
                                key={marker}
                                className={`text-xs transition-colors ${viewingHourOffset >= marker && viewingHourOffset < (marker + 6)
                                        ? 'text-white/80'
                                        : 'text-white/30'
                                    }`}
                            >
                                {item.hour}:00
                            </span>
                        );
                    })}
                </div>

                {/* Current Phase Indicator */}
                <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/5">
                    <PhaseIcon phase={viewingData.sun.phase} />
                    <span className="text-white/40 text-xs capitalize">
                        {viewingData.sun.phase === 'dawn' && '새벽'}
                        {viewingData.sun.phase === 'day' && '낮'}
                        {viewingData.sun.phase === 'dusk' && '저녁'}
                        {viewingData.sun.phase === 'night' && '밤'}
                    </span>
                </div>
            </div>
        </div>
    );
}

// Phase Icon Component
function PhaseIcon({ phase }: { phase: string }) {
    const icon = {
        dawn: '🌅',
        day: '☀️',
        dusk: '🌇',
        night: '🌙',
    }[phase] || '☀️';

    return <span className="text-base">{icon}</span>;
}
