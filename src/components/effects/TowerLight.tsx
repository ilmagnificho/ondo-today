'use client';

import { useWeatherStore } from '@/store/weatherStore';

/**
 * TowerLight - Namsan Signal Component (Polished)
 * 
 * Glows the Namsan Tower tip based on Air Quality Index (AQI)
 * 
 * AQI Color Mapping:
 * - Good (1): Blue #3b82f6
 * - Moderate (2): Green #22c55e
 * - Unhealthy (3/4): Orange #f97316
 * - Hazardous (5/6): Red #ef4444
 * 
 * Refined Visuals:
 * - Removed debug dots
 * - Soft radial gradient with 'screen' blend mode for realistic light
 * - Subtle pulsing animation
 */

// ⚠️ Match coordinates with seoul-day.png
const TOWER_TOP = 6;    // % from top (tip of the tower)
const TOWER_LEFT = 48;  // % from left (center of tower)
const GLOW_SIZE = 90;   // Increased size for softer falloff

export default function TowerLight() {
    const { aqi } = useWeatherStore();

    return (
        <>
            {/* Main Light Core (Intense center) */}
            <div
                className="absolute pointer-events-none z-20 transition-all duration-1000 ease-in-out"
                style={{
                    top: `${TOWER_TOP}%`,
                    left: `${TOWER_LEFT}%`,
                    transform: 'translate(-50%, -50%)',
                    width: GLOW_SIZE,
                    height: GLOW_SIZE,
                    background: `radial-gradient(circle, ${aqi.color} 0%, transparent 60%)`,
                    mixBlendMode: 'screen',
                    filter: 'blur(15px)',
                    opacity: 0.9,
                }}
            />

            {/* Ambient Glow (Large soft halo) */}
            <div
                className="absolute pointer-events-none z-10 animate-pulse-slow"
                style={{
                    top: `${TOWER_TOP}%`,
                    left: `${TOWER_LEFT}%`,
                    transform: 'translate(-50%, -50%)',
                    width: GLOW_SIZE * 2.5,
                    height: GLOW_SIZE * 2.5,
                    background: `radial-gradient(circle, ${aqi.color}40 0%, transparent 70%)`,
                    mixBlendMode: 'plus-lighter',
                    filter: 'blur(30px)',
                }}
            />

            {/* AQI Badge - Moved to Top Left to avoid collision */}
            <div
                className="absolute top-[180px] left-6 z-50 
                    backdrop-blur-xl bg-black/30 border border-white/10 
                    rounded-xl px-3 py-2 flex items-center gap-2
                    shadow-lg shadow-black/10 transition-colors duration-500"
            >
                <div
                    className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    style={{ backgroundColor: aqi.color }}
                />
                <span className="text-white/90 text-xs font-light tracking-wide">
                    {aqi.label}
                </span>
            </div>
        </>
    );
}
