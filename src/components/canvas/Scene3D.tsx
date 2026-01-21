'use client';

import { useEffect, useRef, useState, useMemo, Component, ReactNode } from 'react';
import Spline from '@splinetool/react-spline';
import { Application } from '@splinetool/runtime';
import { useWeatherStore } from '@/store/weatherStore';
import { getCityConfig, isCityAvailable, DEFAULT_CITY_ID } from '@/constants/cities';
import { WEATHER_VISUALS } from '@/lib/types';

// ============================================
// ERROR BOUNDARY
// ============================================
interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

class SplineErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, ErrorBoundaryState> {
    constructor(props: { children: ReactNode; fallback: ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Spline Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

// ============================================
// MAIN CITY SCENE COMPONENT
// ============================================
export default function Scene3D() {
    const splineRef = useRef<Application | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const { weather, currentCityId, setLoading } = useWeatherStore();

    // Get city configuration based on current city ID
    const cityConfig = useMemo(() => {
        const config = getCityConfig(currentCityId);
        // If city doesn't have a valid Spline URL, fall back to default city
        if (!isCityAvailable(currentCityId)) {
            return getCityConfig(DEFAULT_CITY_ID);
        }
        return config;
    }, [currentCityId]);

    // Spline scene URL for current city
    const splineUrl = cityConfig.splineUrl;

    // Handle Spline scene load
    const handleLoad = (spline: Application) => {
        splineRef.current = spline;
        setIsLoaded(true);
        setLoadError(false);
        setLoading(false);
        console.log(`City "${cityConfig.name}" loaded successfully`);

        // Apply initial weather effects
        applyWeatherEffects(spline, weather.condition);
    };

    // Handle Spline load error
    const handleError = (error: unknown) => {
        console.error('Spline load error:', error);
        setLoadError(true);
        setLoading(false);
    };

    // Apply weather effects to the Spline scene
    const applyWeatherEffects = (spline: Application, condition: string) => {
        try {
            // Try to trigger Spline events based on weather
            // These events should be set up in the Spline scene
            spline.emitEvent('mouseDown', `weather-${condition}`);

            // Individual effect triggers
            if (condition === 'night') {
                spline.emitEvent('mouseDown', 'lights-on');
            } else {
                spline.emitEvent('mouseDown', 'lights-off');
            }

            if (condition === 'rain') {
                spline.emitEvent('mouseDown', 'rain-start');
            } else {
                spline.emitEvent('mouseDown', 'rain-stop');
            }

            console.log(`Weather effects applied: ${condition}`);
        } catch (error) {
            console.log('Spline events not configured, using CSS overlay effects');
        }
    };

    // Update scene when weather changes
    useEffect(() => {
        if (!splineRef.current || !isLoaded) return;
        applyWeatherEffects(splineRef.current, weather.condition);
    }, [weather.condition, isLoaded]);

    // Get overlay style based on weather condition
    const overlayStyle = useMemo(() => {
        const visuals = WEATHER_VISUALS[weather.condition];

        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            transition: 'all 1.5s ease-in-out',
        };

        switch (weather.condition) {
            case 'sunny':
                return {
                    ...baseStyle,
                    background: 'radial-gradient(circle at 80% 20%, rgba(255, 236, 179, 0.25) 0%, transparent 50%)',
                };
            case 'rain':
                return {
                    ...baseStyle,
                    background: 'linear-gradient(180deg, rgba(71, 85, 105, 0.4) 0%, rgba(71, 85, 105, 0.2) 100%)',
                };
            case 'night':
                return {
                    ...baseStyle,
                    background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(30, 41, 59, 0.3) 100%)',
                };
            default:
                return baseStyle;
        }
    }, [weather.condition]);

    // Fallback UI when Spline fails to load
    const FallbackScene = () => (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-300 via-blue-200 to-indigo-300 flex items-center justify-center">
            <div className="text-center p-8">
                <div className="text-8xl mb-6">🌆</div>
                <h2 className="text-2xl font-bold text-slate-700 mb-2">
                    {cityConfig.nameKo || cityConfig.name}
                </h2>
                <p className="text-slate-500 max-w-md mb-4">
                    3D 도시 모델을 불러오는 중이거나 사용할 수 없습니다.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-400">
                    {cityConfig.landmarks.map((landmark, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white/50 rounded-full">
                            {landmark}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );

    // Loading UI
    const LoadingScene = () => (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100">
            <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                    <div className="absolute inset-3 flex items-center justify-center text-3xl">
                        🏙️
                    </div>
                </div>
                <p className="text-slate-600 font-medium text-lg">
                    {cityConfig.nameKo} 불러오는 중...
                </p>
                <p className="text-slate-400 text-sm mt-1">
                    Ondo City
                </p>
            </div>
        </div>
    );

    return (
        <div className="relative w-full h-full">
            {/* Loading state */}
            {!isLoaded && !loadError && <LoadingScene />}

            {/* Spline 3D City Scene with Error Boundary */}
            <SplineErrorBoundary fallback={<FallbackScene />}>
                {!loadError && splineUrl ? (
                    <Spline
                        scene={splineUrl}
                        onLoad={handleLoad}
                        onError={handleError}
                        className="w-full h-full"
                    />
                ) : (
                    <FallbackScene />
                )}
            </SplineErrorBoundary>

            {/* Weather-based overlay effect */}
            <div style={overlayStyle} />

            {/* Rain particles overlay (city scale) */}
            {weather.condition === 'rain' && (isLoaded || loadError) && <CityRainEffect />}

            {/* Night stars effect */}
            {weather.condition === 'night' && (isLoaded || loadError) && <NightSkyEffect />}

            {/* City info badge */}
            {isLoaded && (
                <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 
                    bg-black/20 backdrop-blur-sm rounded-full text-white/70 text-xs
                    flex items-center gap-2">
                    <span>🌆</span>
                    <span>{cityConfig.nameKo}</span>
                </div>
            )}
        </div>
    );
}

// ============================================
// WEATHER EFFECT COMPONENTS
// ============================================

/**
 * City-scale rain effect
 * Covers entire viewport with more intense rain
 */
function CityRainEffect() {
    const rainDrops = useMemo(() => {
        return Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            left: `${(i * 0.7) % 100}%`,
            animationDelay: `${(i * 0.03) % 2}s`,
            animationDuration: `${0.3 + (i * 0.005) % 0.2}s`,
            height: `${20 + (i % 15)}px`,
            opacity: 0.3 + (i % 5) * 0.1,
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {rainDrops.map((drop) => (
                <div
                    key={drop.id}
                    className="absolute w-[1.5px] animate-rain-fall"
                    style={{
                        top: '-30px',
                        left: drop.left,
                        height: drop.height,
                        opacity: drop.opacity,
                        animationDelay: drop.animationDelay,
                        animationDuration: drop.animationDuration,
                        background: 'linear-gradient(transparent, rgba(148, 163, 184, 0.6))',
                    }}
                />
            ))}

            {/* Rain mist at ground level */}
            <div className="absolute bottom-0 left-0 right-0 h-32 
                bg-gradient-to-t from-slate-400/30 via-slate-300/10 to-transparent" />
        </div>
    );
}

/**
 * Night sky effect with stars and ambient glow
 */
function NightSkyEffect() {
    const stars = useMemo(() => {
        return Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            left: `${(i * 1.3) % 100}%`,
            top: `${(i * 0.8) % 40}%`, // Stars only in upper portion
            size: i % 4 === 0 ? 'w-1.5 h-1.5' : i % 2 === 0 ? 'w-1 h-1' : 'w-0.5 h-0.5',
            animationDelay: `${(i * 0.15) % 4}s`,
            opacity: 0.4 + (i % 6) * 0.1,
        }));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {/* Stars */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    className={`absolute ${star.size} bg-white rounded-full animate-twinkle`}
                    style={{
                        left: star.left,
                        top: star.top,
                        opacity: star.opacity,
                        animationDelay: star.animationDelay,
                    }}
                />
            ))}

            {/* City glow from below */}
            <div className="absolute bottom-0 left-0 right-0 h-40 
                bg-gradient-to-t from-amber-500/10 via-orange-400/5 to-transparent" />

            {/* Moon */}
            <div className="absolute top-12 right-16 w-16 h-16 rounded-full 
                bg-gradient-to-br from-slate-100 to-slate-200
                shadow-[0_0_30px_8px_rgba(255,255,255,0.15)]">
                <div className="absolute top-3 left-4 w-3 h-3 rounded-full bg-slate-300/40" />
                <div className="absolute top-7 left-8 w-2 h-2 rounded-full bg-slate-300/30" />
            </div>
        </div>
    );
}
