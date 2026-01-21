'use client';

import React, { useMemo, useCallback } from 'react';
import { useWeatherStore } from '@/store/weatherStore';
import { Sun, Moon } from 'lucide-react';

interface TimeSliderProps {
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

export default function TimeSlider({ onDragStart, onDragEnd }: TimeSliderProps) {
    const {
        forecast,
        viewingHourOffset,
        setViewingHourOffset,
        viewingData
    } = useWeatherStore();

    const { sun, weather } = viewingData;

    // Handle slider change
    const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setViewingHourOffset(value);
    }, [setViewingHourOffset]);

    // Handle interaction start/end for frost visibility logic
    const handleInteractionStart = () => {
        if (onDragStart) onDragStart();
    };

    const handleInteractionEnd = () => {
        if (onDragEnd) onDragEnd();
    };

    // Memoize forecast items (limits to 24 hours)
    const forecastItems = useMemo(() => {
        return forecast.slice(0, 24).map((item, index) => ({
            index,
            hour: item.hour,
            temp: Math.round(item.temp),
            label: `${item.hour}:00`,
            isActive: index === viewingHourOffset,
        }));
    }, [forecast, viewingHourOffset]);

    if (forecast.length === 0) return null;

    const max = Math.min(forecast.length - 1, 23);
    const currentHour = forecastItems[Math.min(viewingHourOffset, max)]?.hour || new Date().getHours();
    const isNight = currentHour >= 20 || currentHour < 6;

    return (
        <div className="absolute bottom-8 left-6 right-6 z-40 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="
                glass-card rounded-2xl p-5 
                flex flex-col gap-4
                bg-black/20 backdrop-blur-xl border border-white/10
                shadow-2xl shadow-black/20
            ">
                {/* Header Info */}
                <div className="flex justify-between items-end px-1">
                    <div className="flex flex-col">
                        <span className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1">
                            Time Travel
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-white text-lg font-semibold tabular-nums">
                                {currentHour}:00
                            </span>
                            <span className="text-white/60 text-sm">
                                {isNight ? 'Night' : 'Day'}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-white/50 text-xs font-medium uppercase tracking-wider mb-1 block">
                            Forecast
                        </span>
                        <div className="flex items-center justify-end gap-2 text-white">
                            {isNight ? <Moon size={16} /> : <Sun size={16} />}
                            <span className="text-lg font-semibold tabular-nums">
                                {viewingData.weather.temperature}°
                            </span>
                        </div>
                    </div>
                </div>

                {/* Slider Control */}
                <div className="relative h-12 flex items-center">
                    {/* Track Background */}
                    <div className="absolute w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        {/* Progress Bar */}
                        <div
                            className="h-full bg-gradient-to-r from-blue-400 to-white transition-all duration-100"
                            style={{ width: `${(viewingHourOffset / max) * 100}%` }}
                        />
                    </div>

                    {/* Hourly Tick Marks */}
                    <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
                        {forecastItems.map((item) => (
                            item.index % 3 === 0 && (
                                <div key={item.index} className="flex flex-col items-center justify-center h-full pt-4">
                                    <div className={`w-0.5 h-1.5 rounded-full mb-1 ${item.isActive ? 'bg-white' : 'bg-white/30'}`} />
                                    <span className={`text-[10px] ${item.isActive ? 'text-white font-bold' : 'text-white/40'}`}>
                                        {item.hour}
                                    </span>
                                </div>
                            )
                        ))}
                    </div>

                    {/* Input Range */}
                    <input
                        type="range"
                        min="0"
                        max={max}
                        step="1"
                        value={viewingHourOffset}
                        onChange={handleSliderChange}
                        onMouseDown={handleInteractionStart}
                        onMouseUp={handleInteractionEnd}
                        onTouchStart={handleInteractionStart}
                        onTouchEnd={handleInteractionEnd}
                        className="
                            relative w-full z-10 opacity-0 cursor-pointer h-12
                        "
                    />

                    {/* Custom Thumb Handle (Visual Only - follows state) */}
                    <div
                        className="absolute w-6 h-6 bg-white rounded-full shadow-lg border-2 border-blue-50 pointer-events-none transition-all duration-100 ease-out flex items-center justify-center"
                        style={{
                            left: `${(viewingHourOffset / max) * 100}%`,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
