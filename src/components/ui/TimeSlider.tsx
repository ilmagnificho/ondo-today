'use client';

import React, { useMemo, useCallback, useState } from 'react';
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

    const [isDragging, setIsDragging] = useState(false);

    // Handle slider change
    const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setViewingHourOffset(value);
    }, [setViewingHourOffset]);

    // Handle interaction start/end for frost visibility logic
    const handleInteractionStart = () => {
        setIsDragging(true);
        if (onDragStart) onDragStart();
    };

    const handleInteractionEnd = () => {
        setIsDragging(false);
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
        <div className="absolute bottom-10 left-6 right-6 z-40 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className={`
                rounded-3xl p-2
                flex flex-col gap-2
                transition-all duration-300 ease-out
                ${isDragging ? 'scale-[1.02]' : ''}
            `}>
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
                <div className="relative h-16 flex items-center">
                    {/* Track Background */}
                    <div className="absolute w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
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
                        className="relative w-full z-10 opacity-0 cursor-pointer h-16"
                    />

                    {/* Custom Thumb Handle */}
                    <div
                        className="absolute w-8 h-8 bg-white rounded-full shadow-lg border-2 border-blue-50 pointer-events-none transition-all duration-100 ease-out flex items-center justify-center"
                        style={{
                            left: `${(viewingHourOffset / max) * 100}%`,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
