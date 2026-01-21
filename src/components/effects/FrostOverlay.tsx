'use client';

import { useEffect, useRef } from 'react';

/**
 * FrostOverlay (Optimized)
 * 
 * Features:
 * - Refreezing logic using useRef for performance
 * - High-DPI (Retina) support via window.devicePixelRatio
 * - Improved Touch/Mouse event handling
 * - "Wipe" effect using destination-out composite operation
 */

interface FrostOverlayProps {
    temperature: number;
}

export default function FrostOverlay({ temperature }: FrostOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Animation refs (No state updates to prevent re-renders)
    const isInteractingRef = useRef(false);
    const wipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Config based on temperature
    // Cap opacity to max 0.85
    const frostOpacity = Math.min(0.85, 0.3 + Math.abs(temperature) * 0.05);
    // Refreeze only happens below -5°C
    const refreezeSpeed = temperature < -5 ? Math.abs(temperature + 5) * 0.05 : 0;
    const isVeryCold = temperature < -5;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        // Initialize Canvas with Frost
        const initFrost = () => {
            const dpr = window.devicePixelRatio || 1;

            // Set internal buffer size to match screen pixels
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            // Scale context so drawing operations use logical pixels
            ctx.scale(dpr, dpr);

            // Set CSS size to match logical pixels
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            drawFrostLayer(ctx, window.innerWidth, window.innerHeight, frostOpacity);
        };

        const drawFrostLayer = (context: CanvasRenderingContext2D, w: number, h: number, opacity: number) => {
            context.globalCompositeOperation = 'source-over';
            context.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            context.fillRect(0, 0, w, h);

            // Add organic noise texture
            context.fillStyle = 'rgba(255, 255, 255, 0.15)';
            for (let i = 0; i < 200; i++) {
                const x = Math.random() * w;
                const y = Math.random() * h;
                const size = Math.random() * 100 + 50;
                context.beginPath();
                context.arc(x, y, size, 0, Math.PI * 2);
                context.fill();
            }
        };

        // Refreezing Animation Loop
        const loop = () => {
            // Only refreeze if very cold and NOT currently wiping
            if (isVeryCold && !isInteractingRef.current) {
                // Jitter to make refreezing feel organic (not machine-like)
                if (Math.random() > 0.4) {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.005 * refreezeSpeed})`;

                    // Draw over the logical canvas area
                    // Note: We don't need to manually scale here because ctx is already scaled
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
    }, [temperature, frostOpacity, refreezeSpeed, isVeryCold]); // Removed isInteracting dependency


    // Interaction Handlers (Wiping Logic)
    const handleWipe = (clientX: number, clientY: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Flag interaction start
        isInteractingRef.current = true;

        // Coordinate correction relative to canvas
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        // 'destination-out' = Erase mode
        ctx.globalCompositeOperation = 'destination-out';

        const brushSize = 60;

        // Soft edge brush
        const gradient = ctx.createRadialGradient(x, y, brushSize * 0.2, x, y, brushSize);
        gradient.addColorStop(0, 'rgba(0,0,0,1)');   // Center: Full erase
        gradient.addColorStop(1, 'rgba(0,0,0,0)');   // Edge: Fade

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();

        // 💦 "Melting Edge" Detail (Optional polish)
        // Adds tiny random clear spots nearby to simulate uneven melting/wiping
        if (Math.random() > 0.5) {
            ctx.beginPath();
            ctx.arc(x + (Math.random() - 0.5) * 50, y + (Math.random() - 0.5) * 50, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Debounce timer to resume refreezing
        if (wipeTimeoutRef.current) clearTimeout(wipeTimeoutRef.current);
        wipeTimeoutRef.current = setTimeout(() => {
            isInteractingRef.current = false;
        }, 200);
    };

    return (
        <canvas
            ref={canvasRef}
            // touch-none: Prevents scrolling on mobile while wiping
            className="absolute inset-0 z-30 touch-none cursor-crosshair opacity-90 mix-blend-overlay"

            // Mouse Events
            onMouseDown={(e) => handleWipe(e.clientX, e.clientY)}
            onMouseMove={(e) => {
                // Only wipe if primary button is pressed
                if (e.buttons === 1) handleWipe(e.clientX, e.clientY);
            }}

            // Touch Events
            onTouchStart={(e) => {
                const touch = e.touches[0];
                handleWipe(touch.clientX, touch.clientY);
            }}
            onTouchMove={(e) => {
                const touch = e.touches[0];
                handleWipe(touch.clientX, touch.clientY);
            }}

            // Visual Feel
            style={{
                pointerEvents: 'auto',
                backdropFilter: 'blur(2px)'
            }}
        />
    );
}
