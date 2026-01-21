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
            {/* 
                Namsan Window Glow - Realistic Observation Deck Tint 
                ADJUST COORDINATES HERE IF PNG CHANGES
            */}
            <div
                className="absolute z-10 transition-all duration-1000 ease-in-out mix-blend-color-dodge pointer-events-none"
                style={{
                    /* Coordinates for the Observation Deck Windows - Band Style */
                    top: '6.2%',    // Vertical position of the deck windows
                    left: '49.5%',  // Horizontal center
                    width: '28px',  // Exact pixel width as requested (Band)
                    height: '5px',  // Thinner Band height (5px)

                    transform: 'translate(-50%, 0)',
                    backgroundColor: aqi.color,
                    opacity: 0.9,
                    borderRadius: '1px', // Sharper rounding
                    boxShadow: `0 0 12px 2px ${aqi.color}`, // Neon Glow
                }}
            />
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

            {/* AQI Badge Removed - Relying on Namsan Signal Glow */}
        </>
    );
}
