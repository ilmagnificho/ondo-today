'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import Image from 'next/image';
import { useWeatherStore, getSkyGradient, getOrbStyle } from '@/store/weatherStore';
import TowerLight from '@/components/effects/TowerLight';
import FrostOverlay from '@/components/effects/FrostOverlay';

/**
 * WeatherView v2 - Living Diorama with Time Travel
 * 
 * Features:
 * - Dynamic sky gradients based on viewingData (Time Travel ready)
 * - Sun/Moon constrained to SKY ZONE (Bug Fix)
 * - Namsan Signal integration
 * - Weather particle effects
 * 
 * SUN TRAJECTORY CONSTANTS:
 * Adjust these if the sun/moon position looks off
 */

// ⚠️ SKY ZONE LIMITS - Adjust to fine-tune sun/moon position
const SKY_TOP_LIMIT = 5;     // % from top (highest sun point at noon)
const SKY_BOTTOM_LIMIT = 35;  // % from top (horizon line where sun rises/sets)

interface WeatherViewProps {
    isDragging?: boolean;
}

export default function WeatherView({ isDragging = false }: WeatherViewProps) {
    const { viewingData, isDebugMode, isLoading } = useWeatherStore();
    const { weather, sun } = viewingData;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Dynamic sky gradient based on time phase
    const skyGradient = useMemo(() => {
        return getSkyGradient(sun.phase);
    }, [sun.phase]);

    // City image CSS filter based on time
    const cityFilter = useMemo(() => {
        switch (sun.phase) {
            case 'night':
                return 'brightness(0.35) contrast(1.15) saturate(0.7) hue-rotate(220deg)';
            case 'dawn':
                return 'brightness(0.7) contrast(1.05) saturate(1.1) sepia(0.2)';
            case 'dusk':
                return 'brightness(0.6) contrast(1.1) saturate(1.2) sepia(0.3)';
            case 'day':
            default:
                if (weather.condition === 'rain' || weather.condition === 'clouds') {
                    return 'brightness(0.85) contrast(1.05) saturate(0.9)';
                }
                return 'none'; // Crisp visuals for clear days
        }
    }, [sun.phase, weather.condition]);

    // Orb (Sun/Moon) styling
    const orbStyle = useMemo(() => getOrbStyle(sun.phase), [sun.phase]);

    /**
     * SUN TRAJECTORY BUG FIX:
     * Constrain Y-axis to SKY ZONE only
     * 
     * Logic:
     * - x: Horizontal 10% to 90% (east to west)
     * - y: Constrained between SKY_TOP_LIMIT and SKY_BOTTOM_LIMIT
     * - At sunrise/sunset (pos=0% or 100%): y = SKY_BOTTOM_LIMIT (horizon)
     * - At noon (pos=50%): y = SKY_TOP_LIMIT (highest point)
     */
    const orbPosition = useMemo(() => {
        const pos = sun.position;
        const normalizedPos = pos / 100;

        // Horizontal: 10% to 90% of screen width
        const x = 10 + normalizedPos * 80;

        // Vertical: Constrained arc in sky zone
        // sin(0) = 0, sin(π/2) = 1, sin(π) = 0
        // At edges (sunrise/sunset): y = SKY_BOTTOM_LIMIT
        // At peak (noon): y = SKY_TOP_LIMIT
        const arcHeight = SKY_BOTTOM_LIMIT - SKY_TOP_LIMIT;
        const y = SKY_BOTTOM_LIMIT - arcHeight * Math.sin(normalizedPos * Math.PI);

        return { x, y };
    }, [sun.position]);

    // Weather overlay gradient
    const weatherOverlay = useMemo(() => {
        switch (weather.condition) {
            case 'rain':
                return 'bg-gradient-to-b from-slate-700/40 via-slate-600/20 to-slate-500/30';
            case 'snow':
                return 'bg-gradient-to-b from-slate-200/20 via-white/10 to-slate-100/20';
            case 'clouds':
                return 'bg-gradient-to-b from-slate-500/20 via-transparent to-transparent';
            case 'atmosphere':
                return 'bg-gradient-to-b from-slate-400/30 via-slate-300/20 to-slate-200/20';
            default:
                return '';
        }
    }, [weather.condition]);

    return (
        <div className="relative w-full h-[100dvh] overflow-hidden">
            {/* Layer 0: Dynamic Sky Gradient */}
            <div
                className="absolute inset-0 transition-all duration-[2000ms] ease-out"
                style={{ background: skyGradient }}
            />

            {/* Layer 1: Sun/Moon Removed for cleaner atmosphere */}
            {/* Lighting/Gradient carries the mood instead */}

            {/* Layer 2: City Image */}
            <div
                className="absolute inset-0 transition-all duration-[1500ms] ease-out"
                style={{ filter: cityFilter }}
            >
                <Image
                    src="/images/seoul-day.png"
                    alt="Seoul City"
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="100vw"
                />
            </div>

            {/* Layer 3: Namsan Signal (AQI Glow) */}
            {mounted && <TowerLight />}

            {/* Layer 3.5: Frost Overlay (Interactive Winter Effect) */}
            {mounted && viewingData.weather.temperature <= 0 && (
                <FrostOverlay
                    temperature={viewingData.weather.temperature}
                    isDragging={isDragging}
                />
            )}

            {/* Layer 4: Weather Overlay */}
            <div className={`absolute inset-0 ${weatherOverlay} transition-all duration-1000 pointer-events-none`} />

            {/* Layer 5: Weather Effects */}
            {mounted && (
                <>
                    {weather.condition === 'rain' && <RainEffect />}
                    {weather.condition === 'snow' && <SnowEffect />}
                    {sun.phase === 'night' && <StarField />}
                </>
            )}

            {/* Layer 6: Night City Glow */}
            {sun.phase === 'night' && (
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute bottom-0 left-0 right-0 h-[60%] opacity-60"
                        style={{
                            background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(255,183,77,0.15) 0%, transparent 70%)',
                        }}
                    />
                </div>
            )}

            {/* Layer 7: Vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
                }}
            />

            {/* Debug: Sky Zone Indicator */}
            {isDebugMode && (
                <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-red-500/50 pointer-events-none z-50"
                    style={{ top: `${SKY_BOTTOM_LIMIT}%` }}
                >
                    <span className="absolute -top-5 left-2 text-red-400 text-xs bg-black/50 px-1 rounded">
                        Sky Limit: {SKY_BOTTOM_LIMIT}%
                    </span>
                </div>
            )}
        </div>
    );
}

// Rain Effect
function RainEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        interface Drop { x: number; y: number; speed: number; length: number; opacity: number; }
        const drops: Drop[] = [];
        for (let i = 0; i < 120; i++) {
            drops.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: 12 + Math.random() * 8,
                length: 20 + Math.random() * 25,
                opacity: 0.15 + Math.random() * 0.3,
            });
        }

        let animationId: number;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drops.forEach(drop => {
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x + 0.5, drop.y + drop.length);
                ctx.strokeStyle = `rgba(200, 220, 255, ${drop.opacity})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                drop.y += drop.speed;
                drop.x += 0.8;
                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
            });
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-20" />;
}

// Snow Effect
function SnowEffect() {
    const flakes = useMemo(() => {
        return Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            left: `${(i * 1.7) % 100}%`,
            size: 3 + (i % 4) * 2,
            delay: (i * 0.15) % 5,
            duration: 5 + (i % 4) * 2,
            opacity: 0.4 + (i % 4) * 0.15,
        }));
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {flakes.map(flake => (
                <div
                    key={flake.id}
                    className="absolute rounded-full bg-white animate-snowfall"
                    style={{
                        left: flake.left,
                        top: '-20px',
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                        animationDelay: `${flake.delay}s`,
                        animationDuration: `${flake.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}

// Elegant Star Field
function StarField() {
    // Generate static stars once
    const stars = useMemo(() => {
        return Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`, // Top 60% of screen
            size: Math.random() < 0.8 ? 1.5 : 2.5, // Mostly small, some varied
            opacity: Math.random() * 0.5 + 0.3, // Base opacity
            duration: Math.random() * 3 + 2, // 2s to 5s blink
            delay: Math.random() * 5,
        }));
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none z-5">
            {stars.map(star => (
                <div
                    key={star.id}
                    className="absolute rounded-full bg-white transition-opacity"
                    style={{
                        left: star.left,
                        top: star.top,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        opacity: star.opacity,
                        boxShadow: `0 0 ${star.size + 1}px rgba(255, 255, 255, 0.4)`,
                        animation: `twinkle ${star.duration}s ease-in-out infinite ${star.delay}s`,
                    }}
                />
            ))}
            <style jsx>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
}
