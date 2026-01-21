'use client';

import { useState, useEffect } from 'react';
import { useWeatherStore } from '@/store/weatherStore';

const MESSAGES = {
    freezing: [
        "It's freezing! Long padding is essential today.",
        "Watch out for icy roads.",
        "The air is biting cold.",
        "Keep yourself warm with layers."
    ],
    cold: [
        "It's quite chilly outside.",
        "A warm coat is recommended.",
        "Good weather for hot cocoa."
    ],
    rain: [
        "Don't forget your umbrella.",
        "Roads might be slippery.",
        "A hot coffee sounds good right now."
    ],
    snow: [
        "Snow is falling!",
        "Watch your step on slippery paths.",
        "The world is turning white."
    ],
    badAir: [
        "Mask up! The air is heavy today.",
        "Namsan looks a bit dusty.",
        "Avoid long outdoor activities if possible."
    ],
    default: [
        "Enjoy the winter vibe.",
        "Have a wonderful day.",
        "Stay cozy indoors."
    ]
};

export default function OndoVoice() {
    const { viewingData, weather } = useWeatherStore();
    const [message, setMessage] = useState("");
    const [isFading, setIsFading] = useState(false);

    // Context Analysis to pick relevant messages
    const getContextMessages = () => {
        let options = [...MESSAGES.default];

        // Temperature Context
        if (viewingData.weather.temperature <= -5) {
            options = [...MESSAGES.freezing, ...options];
        } else if (viewingData.weather.temperature <= 5) {
            options = [...MESSAGES.cold, ...options];
        }

        // Condition Context
        const condition = viewingData.weather.condition;
        if (condition === 'rain') {
            options = [...MESSAGES.rain, ...options];
        } else if (condition === 'snow') {
            options = [...MESSAGES.snow, ...options];
        }

        // AQI Context (assuming aqi is available in store or weather object if implemented)
        // For now, simple check if we had AQI data structure
        // options = [...MESSAGES.badAir, ...options];

        return options;
    };

    useEffect(() => {
        const rotateMessage = () => {
            setIsFading(true); // Start fade out

            setTimeout(() => {
                const options = getContextMessages();
                // Select random message different from current if possible
                const nextMessage = options[Math.floor(Math.random() * options.length)];
                setMessage(nextMessage);
                setIsFading(false); // Start fade in
            }, 500); // 0.5s fade out duration
        };

        // Initial set
        rotateMessage();

        const interval = setInterval(rotateMessage, 7000); // Rotate every 7s

        return () => clearInterval(interval);
    }, [viewingData.weather.temperature, viewingData.weather.condition]);

    return (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 pointer-events-none w-full max-w-sm text-center px-4">
            <p
                className={`
                    text-white/80 text-sm font-medium 
                    drop-shadow-md bg-black/10 backdrop-blur-sm px-4 py-1.5 rounded-full inline-block
                    transition-opacity duration-500 ease-in-out
                    ${isFading ? 'opacity-0' : 'opacity-100'}
                `}
            >
                {message}
            </p>
        </div>
    );
}
