"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

export default function MouseTrail() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const trail = useRef<{ x: number; y: number; age: number }[]>([]);
    const rotation = useRef(0);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Clear trail on resize to avoid jumps
            trail.current = [];
        };

        const updateCursor = (e: MouseEvent) => {
            // Add points on move for the trail
            trail.current.push({ x: e.clientX, y: e.clientY, age: 0 });
        };

        // Ultra-Premium "Ethereal/Cosmic" Palette
        const cornerColors = [
            "#F43F5E", // Rose
            "#A855F7", // Purple
            "#3B82F6", // Blue
            "#06B6D4", // Cyan
            "#10B981", // Emerald
            "#FBBF24", // Amber
        ];

        let animationFrameId: number;

        const animate = () => {
            // If light theme, clear and do nothing (effectively disabled)
            if (resolvedTheme === "light") {
                if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Constant rotation for the "spin"
            // Fast spin as requested
            rotation.current += 0.2;

            // Update trails (Age them)
            if (trail.current.length > 0) {
                trail.current = trail.current.map(p => ({ ...p, age: p.age + 1 }));
                // Longer trail for seamless feel
                trail.current = trail.current.filter(p => p.age < 50);
            }

            // Need at least 3 points to draw a smooth spline
            if (trail.current.length < 3) {
                animationFrameId = requestAnimationFrame(animate);
                return;
            }

            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            // Thinner lines for elegance
            ctx.lineWidth = 1.5;

            // We draw 6 continuous lines, one for each corner
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();

                const color = cornerColors[i];
                ctx.strokeStyle = color;
                // Stronger glow
                ctx.shadowColor = color;
                ctx.shadowBlur = 20;

                // Construct the path for THIS corner across all trail points
                // We pre-calculate ribbon points to then draw a spline
                let firstPoint = true;

                for (let j = 0; j < trail.current.length - 1; j++) {
                    const p = trail.current[j];
                    const nextP = trail.current[j + 1];

                    const opacity = 1 - (p.age / 50); // Smoother long fade
                    if (opacity <= 0) continue;

                    // Calculate position of this specific corner (i) at this trail point (j)
                    const twist = j * 0.05; // Slower twist
                    const angle = rotation.current - twist + (i * Math.PI * 2) / 6;

                    const size = 16 * opacity; // Shrink slowly

                    const px = p.x + size * Math.cos(angle);
                    const py = p.y + size * Math.sin(angle);

                    // For Spline, we need the next point too to get the Control Point
                    const nextTwist = (j + 1) * 0.05;
                    const nextAngle = rotation.current - nextTwist + (i * Math.PI * 2) / 6;
                    const nextSize = 16 * (1 - (nextP.age / 50));
                    const nextPx = nextP.x + nextSize * Math.cos(nextAngle);
                    const nextPy = nextP.y + nextSize * Math.sin(nextAngle);

                    if (firstPoint) {
                        ctx.moveTo(px, py);
                        firstPoint = false;
                    } else {
                        // Quadratic Bezier to midpoint
                        const midX = (px + nextPx) / 2;
                        const midY = (py + nextPy) / 2;
                        ctx.quadraticCurveTo(px, py, midX, midY);
                    }
                }
                ctx.stroke();
            }

            // Reset common context
            ctx.shadowBlur = 0;

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", updateCursor);
        resize();
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", updateCursor);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mounted, resolvedTheme]);

    if (!mounted || resolvedTheme === "light") return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[100] mix-blend-screen"
        />
    );
}
