'use client';

import { useEffect, useRef, useState } from 'react';
import { Hand } from 'lucide-react'; // Icon for hint

/**
 * FrostOverlay (UX Improved)
 * 
 * Changes:
 * 1. Vignette Style: Center is clearer, edges are frozen.
 * 2. Visual Hints: "Wipe to clear" guide appears initially.
 * 3. Slider Integration: Frost fades out when dragging time slider.
 */

interface FrostOverlayProps {
    temperature: number;
    isDragging?: boolean; // New prop from parent
}

export default function FrostOverlay({ temperature, isDragging = false }: FrostOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Hint State
    const [showHint, setShowHint] = useState(true);
    const isInteractingRef = useRef(false);
    const wipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isDraggingRef = useRef(isDragging);

    // Update ref when prop changes
    useEffect(() => {
        isDraggingRef.current = isDragging;
    }, [isDragging]);

    // Config
    // Opacity logic: Colder = More opaque edges
    const frostOpacity = Math.min(0.9, 0.4 + Math.abs(temperature) * 0.05);
    const refreezeSpeed = temperature < -5 ? Math.abs(temperature + 5) * 0.05 : 0;
    const isVeryCold = temperature < -5;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const initFrost = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            drawVignetteFrost(ctx, window.innerWidth, window.innerHeight);
        };

        // 🎨 New Vignette Drawing Logic
        const drawVignetteFrost = (context: CanvasRenderingContext2D, w: number, h: number) => {
            context.globalCompositeOperation = 'source-over';

            // Create Radial Gradient (Vignette)
            // Center: Completely transparent
            // Edges: Frosty
            const gradient = context.createRadialGradient(w / 2, h / 2, w * 0.15, w / 2, h / 2, w * 0.7);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)'); // Fully transparent center
            gradient.addColorStop(0.5, `rgba(255, 255, 255, ${frostOpacity * 0.5})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, ${frostOpacity})`);

            context.fillStyle = gradient;
            context.fillRect(0, 0, w, h);


            // Add Noise (Ice Crystals) - Concentrated on edges
            context.fillStyle = 'rgba(255, 255, 255, 0.15)';
            for (let i = 0; i < 200; i++) {
                const angle = Math.random() * Math.PI * 2;
                // Distribute noise more towards edges
                const dist = (Math.random() * 0.5 + 0.5) * (Math.max(w, h) / 2);
                const x = w / 2 + Math.cos(angle) * dist;
                const y = h / 2 + Math.sin(angle) * dist;
                const size = Math.random() * 60 + 20;

                context.beginPath();
                context.arc(x, y, size, 0, Math.PI * 2);
                context.fill();
            }
        };

        // Refreezing Loop
        const loop = () => {
            if (isVeryCold && !isInteractingRef.current && !isDraggingRef.current) {
                // Slower refreeze for vignette style to keep center clear longer
                if (Math.random() > 0.6) {
                    ctx.globalCompositeOperation = 'source-over';
                    // Very subtle refreeze
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.003 * refreezeSpeed})`;
                    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
                }
            }
            animationFrameId = requestAnimationFrame(loop);
        };

        initFrost();
        window.addEventListener('resize', initFrost);
        animationFrameId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', initFrost);
            cancelAnimationFrame(animationFrameId);
        };
        // Removed temperature dependent props to prevent canvas reset
    }, []);

    // Interaction Handlers
    const handleWipe = (clientX: number, clientY: number) => {
        // ... (keep existing handleWipe logic)
        // Hide hint on first interaction
        if (showHint) setShowHint(false);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        isInteractingRef.current = true;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        const brushSize = 70;

        const gradient = ctx.createRadialGradient(x, y, brushSize * 0.2, x, y, brushSize);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();

        if (wipeTimeoutRef.current) clearTimeout(wipeTimeoutRef.current);
        wipeTimeoutRef.current = setTimeout(() => {
            isInteractingRef.current = false;
        }, 200);
    };

    return (
        <div className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-500 ${isDragging ? 'opacity-10' : 'opacity-100'}`}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full touch-none cursor-crosshair mix-blend-overlay pointer-events-auto"
                onMouseDown={(e) => handleWipe(e.clientX, e.clientY)}
                onMouseMove={(e) => {
                    if (e.buttons === 1) handleWipe(e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                    const touch = e.touches[0];
                    handleWipe(touch.clientX, touch.clientY);
                }}
                onTouchMove={(e) => {
                    const touch = e.touches[0];
                    handleWipe(touch.clientX, touch.clientY);
                }}
            // Removed backdrop-filter: blur(2px)
            />

            {/* Guide Hint UI - Removed to be replaced by OndoVoice */}
            {/* Hand icon kept for interaction cue if needed, but text removed as per request */}
            {showHint && !isDragging && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 animate-pulse pointer-events-none opacity-50">
                    <div className="w-12 h-12 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                        <Hand className="text-white w-6 h-6 animate-wave" />
                    </div>
                </div>
            )}
        </div>
    );
}
