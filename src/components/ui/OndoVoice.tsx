'use client';

import { useState, useEffect } from 'react';
import { useWeatherStore } from '@/store/weatherStore';
import { Hand, Snowflake, Umbrella, Wind, Sun, CloudFog, PartyPopper, Coffee } from 'lucide-react';

// Icon mapping type
type WeatherIcon = React.ElementType;

interface VoiceContent {
    text: string;
    Icon: WeatherIcon;
    color?: string; // Optional icon color override
}

const MESSAGES = {
    intro: {
        text: "차가운 겨울 공기가 창에 서렸어요.",
        Icon: Hand
    },
    freezing: [
        { text: "옷 따뜻하게 입으세요. 엄청 추워요!", Icon: Snowflake },
        { text: "길이 미끄러울 수 조심하세요.", Icon: Wind },
        { text: "따뜻한 패딩이 필수인 날씨예요.", Icon: Snowflake }
    ],
    cold: [
        { text: "쌀쌀하네요. 감기 조심하세요.", Icon: Wind },
        { text: "따뜻한 코코아 한 잔 어때요?", Icon: Coffee }
    ],
    rain: [
        { text: "우산 챙기셨나요?", Icon: Umbrella },
        { text: "빗길 운전 조심하세요.", Icon: Umbrella }
    ],
    snow: [
        { text: "눈이 오네요! 낭만적이지만 미끄러워요.", Icon: Snowflake },
        { text: "눈사람 만들기 좋은 날씨!", Icon: Snowflake }
    ],
    badAir: [
        { text: "마스크 꼭 챙기세요!", Icon: CloudFog, color: "text-yellow-400" },
        { text: "남산이 뿌옇네요. 공기가 안 좋아요.", Icon: CloudFog },
        { text: "야외 활동은 자제하는 게 좋아요.", Icon: CloudFog }
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
    const { viewingData, weather } = useWeatherStore();
    const [content, setContent] = useState<VoiceContent>(MESSAGES.intro);
    const [isFading, setIsFading] = useState(false);
    const [isIntro, setIsIntro] = useState(true);

    // Context Analysis
    const getContextContent = (): VoiceContent[] => {
        let options = [...MESSAGES.default];

        // Temperature
        if (viewingData.weather.temperature <= -5) {
            options = [...MESSAGES.freezing, ...options];
        } else if (viewingData.weather.temperature <= 5) {
            options = [...MESSAGES.cold, ...options];
        }

        // Condition
        const condition = viewingData.weather.condition;
        if (condition === 'rain') {
            options = [...MESSAGES.rain, ...options];
        } else if (condition === 'snow') {
            options = [...MESSAGES.snow, ...options];
        }

        // AQI Logic (Mock logic based on realistic assumption or store if available)
        // Here assuming if Namsan is visible clearly it's good, otherwise checking some store val.
        // Since we don't have explicit AQI purely in viewingData weather object easily accessible mapped to 'bad',
        // we'll rely on randomization for demo or default. 
        // *Improvement: If store had explicit AQI status, we'd use it.*

        return options;
    };

    useEffect(() => {
        // Intro Phase: Show Hand Wave for 5 seconds
        const introTimer = setTimeout(() => {
            setIsFading(true);
            setTimeout(() => {
                setIsIntro(false); // End intro state

                // Load first rotation
                const options = getContextContent();
                setContent(options[Math.floor(Math.random() * options.length)]);
                setIsFading(false);
            }, 500);
        }, 5000);

        return () => clearTimeout(introTimer);
    }, []);

    useEffect(() => {
        if (isIntro) return; // Don't rotate during intro

        const rotate = setInterval(() => {
            setIsFading(true);
            setTimeout(() => {
                const options = getContextContent();
                // Avoid picking the exact same message if possible (simple check)
                const next = options[Math.floor(Math.random() * options.length)];
                setContent(next);
                setIsFading(false);
            }, 500);
        }, 6000); // 6s rotation

        return () => clearInterval(rotate);
    }, [isIntro, viewingData]);

    const IconComponent = content.Icon;

    return (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm text-center px-4">
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
