'use client';

import { useEffect } from 'react';
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
    isDebugMode,
    toggleDebugMode,
    setTimePhase,
    setCondition,
    viewingData,
    viewingHourOffset,
  } = useWeatherStore();

  // Fetch real weather on mount
  useEffect(() => {
    fetchWeather('Seoul');

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      if (!isDebugMode && viewingHourOffset === 0) {
        fetchWeather('Seoul');
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchWeather, isDebugMode, viewingHourOffset]);

  return (
    <main className="relative w-screen h-[100dvh] overflow-hidden">
      {/* Living Diorama View */}
      <WeatherView />

      {/* Weather Info Overlay */}
      <WeatherInfo />

      {/* Time Travel Slider */}
      <TimeSlider />

      {/* Brand Logo - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-40">
        <h1 className="text-xl font-semibold text-white/90 tracking-tight drop-shadow-lg">
          Ondo
          <span className="text-xs font-light text-white/40 ml-2">Seoul</span>
        </h1>
      </div>

      {/* Debug Toggle - Moved up to not overlap with slider */}
      <button
        onClick={toggleDebugMode}
        className="absolute top-8 right-[140px] z-50 w-9 h-9 rounded-full 
                    backdrop-blur-lg bg-white/10 border border-white/20 
                    flex items-center justify-center text-white/60 text-sm
                    hover:bg-white/20 transition-all active:scale-95"
        title="Debug Mode"
      >
        {isDebugMode ? '✕' : '🐛'}
      </button>

      {/* Debug Panel */}
      {isDebugMode && (
        <div className="absolute top-20 right-6 z-50 
                    backdrop-blur-2xl bg-black/50 border border-white/20 rounded-2xl p-4
                    animate-fadeIn min-w-[200px]">
          <p className="text-xs text-white/40 mb-3 font-medium">Debug Controls</p>

          {/* Time Phase */}
          <div className="mb-3">
            <p className="text-xs text-white/50 mb-2">Time Phase</p>
            <div className="flex gap-1.5 flex-wrap">
              {(['dawn', 'day', 'dusk', 'night'] as TimePhase[]).map((phase) => (
                <button
                  key={phase}
                  onClick={() => setTimePhase(phase)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                                        ${viewingData.sun.phase === phase
                      ? 'bg-white/25 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/15'
                    }`}
                >
                  {phase === 'dawn' && '🌅'}
                  {phase === 'day' && '☀️'}
                  {phase === 'dusk' && '🌇'}
                  {phase === 'night' && '🌙'}
                </button>
              ))}
            </div>
          </div>

          {/* Weather Condition */}
          <div>
            <p className="text-xs text-white/50 mb-2">Weather</p>
            <div className="flex gap-1.5 flex-wrap">
              {(['clear', 'clouds', 'rain', 'snow'] as WeatherCondition[]).map((cond) => (
                <button
                  key={cond}
                  onClick={() => setCondition(cond)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all
                                        ${viewingData.weather.condition === cond
                      ? 'bg-white/25 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/15'
                    }`}
                >
                  {cond === 'clear' && '☀️'}
                  {cond === 'clouds' && '☁️'}
                  {cond === 'rain' && '🌧️'}
                  {cond === 'snow' && '❄️'}
                </button>
              ))}
            </div>
          </div>

          {/* State Info */}
          <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/40 space-y-1">
            <p>Phase: {viewingData.sun.phase} | Hour: {viewingData.sun.hour}</p>
            <p>Sun Position: {viewingData.sun.position.toFixed(1)}%</p>
            <p>Time Offset: +{viewingHourOffset}h</p>
          </div>
        </div>
      )}
    </main>
  );
}
