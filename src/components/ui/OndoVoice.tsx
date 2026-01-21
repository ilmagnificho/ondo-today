'use client';

import { useState, useEffect } from 'react';
import { useWeatherStore } from '@/store/weatherStore';
import { Hand, Snowflake, Umbrella, Wind, Sun, CloudFog, PartyPopper, Coffee, ThermometerSun } from 'lucide-react';

// Icon mapping type
type WeatherIcon = React.ElementType;

interface VoiceContent {
    text: string;
    Icon: WeatherIcon;
    color?: string; // Optional icon color override
}

const MESSAGES = {
    intro: {
        text: "창문에 성에가 꼈네요. 터치해서 닦아보세요.",
        Icon: Hand
    },
    windy: [
        { text: "바람이 매섭습니다. 옷깃을 여미세요.", Icon: Wind },
        { text: "실제 온도보다 훨씬 춥게 느껴져요.", Icon: Wind }
    ],
    freezing: [
        { text: "살을 에는 추위네요. 방한용품 필수!", Icon: Snowflake },
        { text: "길이 미끄러우니 조심하세요.", Icon: Snowflake }
    ],
    cold: [
        { text: "바람 때문에 실제보다 훨씬 추워요.", Icon: ThermometerSun },
        { text: "따뜻한 코코아 한 잔 어때요?", Icon: Coffee }
    ],
    rain: [
        { text: "우산 챙기셨나요? 빗길 조심하세요.", Icon: Umbrella },
        { text: "도로가 미끄러울 수 있어요.", Icon: Umbrella }
    ],
    snow: [
        { text: "눈이 오네요! 낭만적이지만 미끄러워요.", Icon: Snowflake },
        { text: "눈사람 만들기 좋은 날씨!", Icon: Snowflake }
    ],
    badAir: [
        { text: "공기가 탁해요. 마스크를 꼭 챙기세요.", Icon: CloudFog, color: "text-yellow-400" },
        { text: "미세먼지가 심하니 야외 활동은 자제하세요.", Icon: CloudFog }
    ],
    goodAir: [
        { text: "남산이 초록색이네요! (공기 좋음)", Icon: PartyPopper, color: "text-green-400" },
        { text: "상쾌한 공기를 마셔보세요.", Icon: Sun }
    ],
    default: [
        { text: "오늘도 좋은 하루 보내세요.", Icon: Sun },
        { text: "겨울 분위기를 즐겨보세요.", Icon: Snowflake },
        { text: "따뜻하게 입고 다니세요.", Icon: Wind }
    ]
};

export default function OndoVoice() {
    const { viewingData, aqi } = useWeatherStore();
    const [content, setContent] = useState<VoiceContent>(MESSAGES.intro);
    const [isFading, setIsFading] = useState(false);
    const [isIntro, setIsIntro] = useState(true);
    const [isHidden, setIsHidden] = useState(false); // Hide on interaction

    // Smart Context Analysis
    const getContextContent = (): VoiceContent[] => {
        let options = [...MESSAGES.default];

        const { temperature, feelsLike, windKph, condition } = viewingData.weather;

        // Wind Warning
        if (windKph > 20) {
            options = [...MESSAGES.windy, ...options];
        }

        // Extreme Cold
        if (temperature < -10) {
            options = [...MESSAGES.freezing, ...options];
        }

        // Wind Chill Factor (Feels like is significantly lower)
        if (feelsLike < temperature - 3) {
            options = [...MESSAGES.cold, ...options];
        }

        // AQI Logic
        if (aqi.index >= 3) { // 3=Unhealthy
            options = [...MESSAGES.badAir, ...options];
        }

        // Condition
        if (condition === 'rain') {
            options = [...MESSAGES.rain, ...options];
        } else if (condition === 'snow') {
            options = [...MESSAGES.snow, ...options];
        }

        return options;
    };

    // Update voice when viewingData changes (Dynamically react to slider)
    useEffect(() => {
        if (isIntro || isHidden) return;

        setIsFading(true);
        const timeout = setTimeout(() => {
            const options = getContextContent();
            const next = options[Math.floor(Math.random() * options.length)];
            setContent(next);
            setIsFading(false);
        }, 300); // Fast transition

        return () => clearTimeout(timeout);
    }, [viewingData.weather.temperature, viewingData.weather.condition, isIntro, isHidden]);

    // Cleanup Intro
    useEffect(() => {
        const introTimer = setTimeout(() => {
            if (isIntro) {
                setIsFading(true);
                setTimeout(() => {
                    setIsIntro(false);
                }, 500);
            }
        }, 5000);
        return () => clearTimeout(introTimer);
    }, [isIntro]);

    // Interaction Listener: Listen for "wipe" events (using a custom event or check pointer?)
    // For now, let's rely on simple pointer events on window or specific components if possible.
    // Or we can assume ANY click on the screen means interaction if we use a global listener, 
    // but better to just let the user click THIS component to dismiss, OR use the FrostOverlay's interaction.
    // Since FrostOverlay handles the wipe, we can listen for a global custom event 'frost-wipe' if we implemented it, 
    // or just listen for generic touch/mousedown globally.
    useEffect(() => {
        const handleInteraction = () => {
            // If intro is still active, hide it immediately on first touch (as per request)
            if (isIntro) {
                setIsIntro(false);
            }
        };

        window.addEventListener('mousedown', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        return () => {
            window.removeEventListener('mousedown', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, [isIntro]);

    const IconComponent = content.Icon;

    if (isHidden) return null;

    return (
        <div className="absolute bottom-48 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm text-center px-4 transition-all duration-300">
            <div
                className={`
                    inline-flex items-center gap-2
                    bg-black/30 backdrop-blur-md border border-white/10
                    px-4 py-2 rounded-full shadow-lg
                    transition-all duration-500 ease-in-out transform
                    ${isFading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
                `}
            >
                <div className={`${isIntro ? 'animate-wave-hand' : ''} ${content.color || 'text-white'}`}>
                    <IconComponent size={20} />
                </div>
                <span className="text-white/90 text-sm font-medium drop-shadow-md whitespace-nowrap">
                    {content.text}
                </span>
            </div>

            <style jsx global>{`
                @keyframes wave {
                    0% { transform: rotate(0deg); }
                    10% { transform: rotate(14deg); }
                    20% { transform: rotate(-8deg); }
                    30% { transform: rotate(14deg); }
                    40% { transform: rotate(-4deg); }
                    50% { transform: rotate(10deg); }
                    60% { transform: rotate(0deg); }
                    100% { transform: rotate(0deg); }
                }
                .animate-wave-hand {
                    animation: wave 2.5s infinite;
                    transform-origin: 70% 70%;
                }
            `}</style>
        </div>
    );
}
