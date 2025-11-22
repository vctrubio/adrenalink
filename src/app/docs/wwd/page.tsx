"use client";

import { useEffect, useRef, useState } from "react";
import { BackgroundImage } from "@/src/components/BackgroundImage";
import { ENTITY_DATA } from "@/config/entities";
import { RAINBOW_COLORS } from "@/config/rainbow-entities";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";
import AdranlinkIcon from "@/public/appSvgs/AdranlinkIcon";

const FEATURES = [
    {
        title: "Registration",
        name: "Students",
        accentColor: RAINBOW_COLORS["yellow-1"].fill,
        icon: HelmetIcon,
        items: ["2-click booking process from request to confirmation", "Real-time lesson notifications and live updates", "Transparent pricing with package hour tracking", "Progress tracking and skill level management"],
    },
    {
        title: "Statistics",
        name: "Teachers",
        accentColor: RAINBOW_COLORS["green-2"].fill,
        icon: HeadsetIcon,
        items: ["Live sync scheduling with instant notifications", "Automatic commission calculations per lesson", "Quick hour confirmation and real-time tracking", "Earnings dashboard with transparent payments"],
    },
    {
        title: "Management",
        name: "Lessons",
        accentColor: RAINBOW_COLORS["blue-2"].fill,
        icon: FlagIcon,
        items: ["2-click creation from student request to event", "Visual classboard for drag-and-drop scheduling", "Automatic equipment assignment and tracking", "Live sync across all portals in real-time"],
    },
    {
        title: "Tracking",
        name: "Equipment",
        accentColor: RAINBOW_COLORS["purple-2"].fill,
        icon: EquipmentIcon,
        items: ["Automatic flight hours logging per lesson", "Damage and injury tracking for maintenance", "Multi-lesson attachment and status management", "Rental inventory with availability tracking"],
    },
    {
        title: "We Help You Scale",
        name: "Schools",
        accentColor: RAINBOW_COLORS["grey-2"].fill,
        icon: AdminIcon,
        items: ["Enterprise-grade automation saving 10+ hours per week", "Revenue analytics with real-time financial insights", "Grow your social links with integrated platforms", "Join our network and get discovered by students worldwide"],
    },
];

const FeatureCard = ({ feature, isLastCard }: { feature: (typeof FEATURES)[0]; isLastCard: boolean }) => {
    const IconComponent = feature.icon;

    return (
        <div
            className={`rounded-2xl px-6 py-4  backdrop-blur-xl border-2 shadow-2xl transition-all duration-300 hover:scale-[1.02] ${isLastCard ? "md:col-span-2" : ""}`}
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                borderColor: feature.accentColor,
                boxShadow: `0 10px 40px ${feature.accentColor}30`,
            }}
        >
            {/* Header with Icon on Left */}
            <div className="mb-4">
                <div className="flex justify-between items-center ">
                    <div className="flex">
                        <div className="w-24 h-24 flex items-center justify-center flex-shrink-0 rounded-2xl">
                            <div style={{ color: feature.accentColor }}>
                                <IconComponent className="w-16 h-16 flex-shrink-0" />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <h2 className="text-4xl font-bold text-white" style={{ color: feature.accentColor }}>
                                {feature.title}
                            </h2>
                            <div className="text-xs uppercase tracking-wider text-white/60 mt-1">{feature.name}</div>
                        </div>
                    </div>

                    {/* Banner for "We Help You Scale" */}
                    {isLastCard && (
                        <div className="hidden md:inline-block bg-tertiary/20 backdrop-blur-md rounded-full px-6 py-3 border border-tertiary">
                            <div className="text-xl md:text-2xl font-mono text-tertiary">tarifa.adrenalink.tech</div>
                        </div>
                    )}
                </div>
                <div className="border-b-1" style={{ borderColor: feature.accentColor }} />
            </div>

            {/* Content */}
            <ul className="space-y-1 mx-6">
                {feature.items.map((item, itemIndex) => (
                    <li
                        key={itemIndex}
                        className="flex items-start gap-1 text-base text-white/90 px-3 py-2 rounded-lg transition-colors duration-200"
                        style={{
                            backgroundColor: "transparent",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = `${feature.accentColor}20`;
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        }}
                    >
                        <div className="flex-shrink-0 mt-1" style={{ color: feature.accentColor }}>
                            <AdranlinkIcon className="w-4 h-4" />
                        </div>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default function WhatWeDoPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [iconPositions, setIconPositions] = useState<Array<{ x: number; y: number; entityIndex: number; opacity: number }>>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        const draw = () => {
            time += 0.005;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Subtle wave patterns
            for (let layer = 0; layer < 2; layer++) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.05 - layer * 0.02})`;
                ctx.lineWidth = 1;

                for (let x = 0; x < canvas.width; x += 3) {
                    const wave1 = Math.sin(x * 0.01 + time + layer) * 30;
                    const wave2 = Math.sin(x * 0.005 + time * 0.5 + layer * 2) * 20;
                    const y = centerY + wave1 + wave2;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // Calculate positions for floating entity icons
            const newPositions: Array<{ x: number; y: number; entityIndex: number; opacity: number }> = [];
            for (let i = 0; i < ENTITY_DATA.length; i++) {
                const entityIndex = i;
                const angle = (i / ENTITY_DATA.length) * Math.PI * 2 + time * 0.5;
                const radius = 250 + Math.sin(time + i) * 80;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius * 0.3;
                const opacity = 0.5 + Math.sin(time + i) * 0.3;

                newPositions.push({ x, y, entityIndex, opacity });
            }

            setIconPositions(newPositions);
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
        <div className="relative">
            <BackgroundImage src="/kritaps_ungurs_unplash/forest.jpg" position="fixed" overlay="linear-gradient(to bottom, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 0.85) 100%)" />

            {/* Hero Section with Animated Background */}
            <section ref={containerRef} className="relative h-[40vh] flex items-center justify-center overflow-hidden z-[2]">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                {/* Floating Entity Icons */}
                {iconPositions.map((pos, index) => {
                    const entity = ENTITY_DATA[pos.entityIndex];
                    const IconComponent = entity.icon;
                    return (
                        <div
                            key={index}
                            className="absolute pointer-events-none transition-opacity duration-300 z-[3]"
                            style={{
                                left: `${pos.x}px`,
                                top: `${pos.y}px`,
                                transform: "translate(-50%, -50%)",
                                color: entity.color,
                            }}
                        >
                            <IconComponent className="w-6 h-6" />
                        </div>
                    );
                })}

                <div className="relative z-[4] text-center">
                    <h1 className="text-6xl md:text-7xl font-bold tracking-tight drop-shadow-2xl text-white">What We Do</h1>
                </div>
            </section>

            {/* Content Sections */}
            <div className="relative z-[2] max-w-7xl mx-auto px-6 py-16 pb-32">
                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {FEATURES.map((feature, index) => (
                        <FeatureCard key={index} feature={feature} isLastCard={index === FEATURES.length - 1} />
                    ))}
                </div>
            </div>
        </div>
    );
}
