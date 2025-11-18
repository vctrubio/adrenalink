"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { WindToggle } from "@/src/components/themes/WindToggle";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

interface School {
    id: string;
    name: string;
    username: string;
    country: string;
}

interface NoSchoolFoundProps {
    username: string;
    schools: School[];
}

export function NoSchoolFound({ username, schools }: NoSchoolFoundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const draw = () => {
            time += 0.008;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Ripple effect - expanding circles
            for (let i = 0; i < 8; i++) {
                const rippleTime = (time * 2 + i * 0.5) % 4;
                const radius = rippleTime * 150;
                const opacity = Math.max(0, 1 - rippleTime / 4);

                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(251, 146, 60, ${opacity * 0.3})`; // orange
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Orbiting particles
            for (let i = 0; i < 30; i++) {
                const angle = (i / 30) * Math.PI * 2 + time * 0.5;
                const orbitRadius = 150 + Math.sin(time * 2 + i * 0.3) * 50;
                const x = centerX + Math.cos(angle) * orbitRadius;
                const y = centerY + Math.sin(angle) * orbitRadius * 0.6;
                
                const size = 2 + Math.sin(time * 3 + i) * 1.5;
                const opacity = 0.4 + Math.sin(time * 2 + i * 0.5) * 0.3;

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(251, 146, 60, ${opacity})`;
                ctx.fill();
            }

            // Flowing sine waves
            for (let layer = 0; layer < 4; layer++) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(251, 146, 60, ${0.08 - layer * 0.015})`;
                ctx.lineWidth = 1.5;

                for (let x = 0; x < canvas.width; x += 3) {
                    const wave1 = Math.sin(x * 0.008 + time * 2 + layer * 0.5) * 40;
                    const wave2 = Math.sin(x * 0.015 + time * 1.5 + layer) * 25;
                    const y = centerY + wave1 + wave2 + layer * 30 - 60;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // Pulsing glow in center
            const pulseSize = 80 + Math.sin(time * 1.5) * 30;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseSize);
            gradient.addColorStop(0, `rgba(251, 146, 60, ${0.15 + Math.sin(time * 2) * 0.1})`);
            gradient.addColorStop(1, "rgba(251, 146, 60, 0)");
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

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
        <div className="min-h-screen relative overflow-hidden bg-background">
            {/* Animated Background Canvas */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Theme Toggle - Top Right */}
            <div className="absolute top-6 right-6 z-20">
                <WindToggle />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 py-16">
                {/* Error Message */}
                <div className="text-center mb-16 pt-20">
                    <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-[#fb923c] to-[#f59e0b] bg-clip-text text-transparent">
                        404
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">
                        School Not Found
                    </h2>
                    <p className="text-xl text-muted-foreground mb-2">
                        Looking for: <span className="font-mono font-semibold text-[#fb923c]">{username}</span>
                    </p>
                </div>

                {/* Schools List */}
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">
                        Browse Available Schools
                    </h3>

                    <div className="space-y-4">
                        {schools.map((school, index) => (
                            <Link
                                key={school.id}
                                href={`https://${school.username}.adrenalink.tech`}
                                className="group relative bg-card border border-border rounded-lg p-6 hover:border-[#fb923c]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#fb923c]/10 flex items-center justify-between"
                                style={{
                                    animation: mounted ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : undefined,
                                }}
                            >
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold text-foreground group-hover:text-[#fb923c] transition-colors mb-2">
                                            {school.name}
                                        </h4>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="font-mono text-[#fb923c]">@{school.username}</span>
                                            <span>{school.country}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-8 h-8 rounded-full bg-[#fb923c]/10 flex items-center justify-center group-hover:bg-[#fb923c]/20 transition-colors flex-shrink-0">
                                    <div className="transform rotate-90">
                                        <AdranlinkIcon size={20} className="text-[#fb923c]" />
                                    </div>
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-br from-[#fb923c]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
                            </Link>
                        ))}
                    </div>

                    {schools.length === 0 && (
                        <div className="text-center py-12 bg-card rounded-lg border border-border">
                            <p className="text-muted-foreground text-lg">
                                No schools available at this time
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
