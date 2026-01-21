'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import WeatherInfo from '@/components/ui/WeatherInfo';
import TimeSlider from '@/components/ui/TimeSlider';
import { useWeatherStore, TimePhase, WeatherCondition } from '@/store/weatherStore';

// Dynamic import for WeatherView
const WeatherView = dynamic(() => import('@/components/WeatherView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[100dvh] bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">서울의 하늘을 불러오는 중...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const {
    fetchWeather,
    viewingData,
    viewingHourOffset,
    isLoading,
  } = useWeatherStore();

  const [isTimeTravelDragging, setIsTimeTravelDragging] = useState(false);

  // Fetch real weather on mount
  useEffect(() => {
    fetchWeather('Seoul');

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchWeather('Seoul');
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchWeather]); // Removed viewingHourOffset dependency

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden">
      {/* Living Diorama View */}
      {/* @ts-ignore - Dynamic component props mismatch workaround for now */}
      <WeatherView isDragging={isTimeTravelDragging} />

      {/* Weather Info Overlay */}
      <WeatherInfo />

      {/* Time Travel Slider */}
      <TimeSlider
        onDragStart={() => setIsTimeTravelDragging(true)}
        onDragEnd={() => setIsTimeTravelDragging(false)}
      />

      {/* Brand Logo - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-40">
        <h1 className="text-xl font-semibold text-white/90 tracking-tight drop-shadow-lg">
          Ondo
          <span className="text-xs font-light text-white/40 ml-2">Seoul</span>
        </h1>
      </div>

      {/* Subtle Loading Indicator - Center Bottom (above slider) */}
      {/* Show only when refreshing existing data (not initial load) */}
      {/* Also hidden during Time Travel to avoid distraction */}
      {viewingHourOffset === 0 && isLoading && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 animate-fadeIn">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 shadow-lg">
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-[10px] text-white/60 font-medium">Updating...</span>
          </div>
        </div>
      )}

      {/* Subtle Loading Indicator - Center Bottom (above slider) */}
      {/* Show only when refreshing existing data (not initial load) */}
      {viewingHourOffset === 0 && (
        <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-[10px] text-white/60 font-medium">Updating...</span>
          </div>
        </div>
      )}
    </main>
  );
}
