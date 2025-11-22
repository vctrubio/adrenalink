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

const FEATURES = [
    {
        title: "Registration",
        accentColor: RAINBOW_COLORS["yellow-1"].fill,
        icon: HelmetIcon,
        items: ["Register form with personal details and invitation to app", "Package request - browse and apply for courses", "Booking progress tracking throughout their journey", "Revenue tracker for transparent payment history"],
    },
    {
        title: "Statistics",
        accentColor: RAINBOW_COLORS["green-2"].fill,
        icon: HeadsetIcon,
        items: ["Commissions per lesson with flexible rate structures", "Lesson management - assigned bookings and schedules", "Revenue tracker showing earnings in real-time"],
    },
    {
        title: "Management",
        accentColor: RAINBOW_COLORS["blue-2"].fill,
        icon: FlagIcon,
        items: ["Classboard for daily operations and lesson planning", "Dashboard for live alerts and real-time notifications", "Tracking of hours and payments with full transparency"],
    },
    {
        title: "Tracking",
        accentColor: RAINBOW_COLORS["purple-2"].fill,
        icon: EquipmentIcon,
        items: ["Register your stock and track activity or injuries", "Attach equipment to packages, bookings, lessons and events", "Manage statuses: for rental, linked to teacher, free of use, or ready to sell"],
    },
    {
        title: "We Help You Scale",
        accentColor: RAINBOW_COLORS["grey-2"].fill,
        icon: AdminIcon,
        items: ["Custom URLs and unique subdomains for your school", "Integrate Instagram, website, and googlePlaceId", "Personal space with custom icons and banners", "World mapping to help students find your location"],
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
                                <IconComponent className="w-12 h-12 flex-shrink-0" />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                            <h2 className="text-3xl font-bold text-white flex-shrink-0" style={{ color: feature.accentColor }}>
                                {feature.title}
                            </h2>
                        </div>
                    </div>

                    {/* Banner for "We Help You Scale" */}
                    {isLastCard && (
                        <div className="inline-block bg-tertiary/20 backdrop-blur-md rounded-full px-6 py-3 border border-tertiary">
                            <div className="text-xl md:text-2xl font-mono text-tertiary">tarifa.adrenalink.tech</div>
                        </div>
                    )}
                </div>
                <div className="border-b-1" style={{ borderColor: feature.accentColor }} />
            </div>

            {/* Content */}
            <ul className="space-y-3 mx-6">
                {feature.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-base text-white/90">
                        <span className="text-xl flex-shrink-0 mt-1" style={{ color: feature.accentColor }}>
                            •
                        </span>
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
                                opacity: pos.opacity,
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
