"use client";

import { useEffect, useRef } from "react";

export function InteractiveBorder() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = 20;
        };

        const draw = () => {
            time += 0.03;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerY = canvas.height / 2;

            // Create flowing wave pattern along the border
            for (let layer = 0; layer < 3; layer++) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.6 - layer * 0.15})`;
                ctx.lineWidth = 3;

                for (let x = 0; x < canvas.width; x += 2) {
                    const wave1 = Math.sin(x * 0.008 + (time * 2 + layer)) * 4;
                    const wave2 = Math.sin(x * 0.015 + (time * 1.5 + layer * 2)) * 3;
                    const y = centerY + wave1 + wave2;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            animationId = requestAnimationFrame(draw);
        };

        resizeCanvas();
        draw();

        window.addEventListener("resize", resizeCanvas);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    return (
        <div className="absolute bottom-0 left-0 w-full overflow-visible pointer-events-none" style={{ height: "20px", bottom: "-8px" }}>
            {/* Base border */}
            <div className="absolute left-0 bg-secondary" style={{ height: "4px", width: "100%", top: "8px" }} />

            {/* Animated wave canvas on top */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0"
            />
        </div>
    );
}
