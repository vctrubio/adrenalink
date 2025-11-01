"use client";

import { useEffect, useRef, useState } from "react";
import { ENTITY_DATA } from "@/config/entities";
import AdminIcon from "@/public/appSvgs/AdminIcon";
import EquipmentIcon from "@/public/appSvgs/EquipmentIcon";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import HelmetIcon from "@/public/appSvgs/HelmetIcon";
import HeadsetIcon from "@/public/appSvgs/HeadsetIcon";

// Sub-component for feature sections
function FeatureSection({ title, items, accentColor }: { title: string; items: string[]; accentColor: string }) {
    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold mb-6" style={{ color: accentColor }}>
                {title}
            </h2>
            <ul className="space-y-3">
                {items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-lg">
                        <span className="text-2xl" style={{ color: accentColor }}>
                            •
                        </span>
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Extract RGB values from tailwind color classes
const getColorFromClass = (colorClass: string): string => {
    const colorMap: Record<string, string> = {
        "text-indigo-500": "99, 102, 241",
        "text-yellow-500": "234, 179, 8",
        "text-amber-500": "245, 158, 11",
        "text-orange-400": "251, 146, 60",
        "text-green-500": "34, 197, 94",
        "text-emerald-500": "16, 185, 129",
        "text-blue-500": "59, 130, 246",
        "text-metal-700": "63, 63, 70",
        "text-cyan-500": "6, 182, 212",
        "text-purple-500": "168, 85, 247",
        "text-sand-600": "209, 130, 57",
        "text-sand-800": "147, 82, 31",
        "text-slate-500": "100, 116, 139",
    };
    return colorMap[colorClass] || "59, 130, 246";
};

const FEATURES = [
    {
        title: "Lesson Management App",
        accentColor: "rgb(59, 130, 246)",
        icon: FlagIcon,
        items: ["Real time sync across all portals", "Proof of stake - transparency in what everyone is paying", "Confirmations and feedback from teachers and students", "Progress tracking and comprehensive data analytics"],
    },
    {
        title: "Equipment Tracking",
        accentColor: "rgb(168, 85, 247)",
        icon: EquipmentIcon,
        items: ["Track which equipment, monitor number of flight hours", "Know what, when, and analyze condition over time", "Too good to sell? Set a timer to know when enough is enough"],
    },
    {
        title: "Student Registration",
        accentColor: "rgb(234, 179, 8)",
        icon: HelmetIcon,
        items: ["Students register to your school through custom URL", "Browse and pick packages that match their needs", "Submit a request for your approval", "One click to create the booking - it's that simple"],
    },
    {
        title: "Teacher Management",
        accentColor: "rgb(34, 197, 94)",
        icon: HeadsetIcon,
        items: ["Rank your teachers based on performance and reliability", "Receive direct feedback from students after each lesson", "Track teaching hours and commissions in real-time"],
    },
    {
        title: "And! We Help Upscale Your Business",
        accentColor: "rgb(255, 190, 165)",
        icon: AdminIcon,
        items: ["Marketing tools with custom URLs for your school", "Showcase photos and banners - tell us why your school is the coolest", "World mapping to help students find your location", "Join one adrenaline community connecting schools globally"],
    },
];

export default function WhatWeDoPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [iconPositions, setIconPositions] = useState<Array<{ x: number; y: number; entityIndex: number; opacity: number }>>([]);
    const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
    const [cardOrder, setCardOrder] = useState<number[]>([0, 1, 2, 3, 4]);
    const [cardsDealt, setCardsDealt] = useState<boolean>(false);

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

    // Card dealing animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setCardsDealt(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative">
            {/* Background Forest Image */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url(/kritaps_ungurs_unplash/forest.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

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
                            }}
                        >
                            <IconComponent className={`w-6 h-6 ${entity.color}`} />
                        </div>
                    );
                })}

                <div className="relative z-[4] text-center">
                    <h1 className="text-6xl md:text-7xl font-bold tracking-tight drop-shadow-2xl text-white">What We Do</h1>
                </div>
            </section>

            {/* Content Sections */}
            <div className="relative z-[2] max-w-5xl mx-auto px-6 py-16 pb-32">
                {/* Feature Cards Stack */}
                <div className="relative h-[600px]">
                    {cardOrder.map((featureIndex, stackPosition) => {
                        const feature = FEATURES[featureIndex];
                        const isSelected = selectedFeature === featureIndex;
                        const baseOffset = FEATURES.length - 1 - stackPosition;
                        const yOffset = isSelected ? -200 : baseOffset * 80;
                        const dealDelay = stackPosition * 150; // Stagger each card by 150ms
                        const IconComponent = feature.icon;

                        const handleClick = () => {
                            if (isSelected) {
                                // Close: move this card to top of stack
                                const newOrder = [featureIndex, ...cardOrder.filter(i => i !== featureIndex)];
                                setCardOrder(newOrder);
                                setSelectedFeature(null);
                            } else {
                                setSelectedFeature(featureIndex);
                            }
                        };

                        return (
                            <div
                                key={featureIndex}
                                className="absolute bottom-0 left-0 right-0 cursor-pointer transition-all duration-500 ease-out"
                                style={{
                                    transform: cardsDealt ? `translateY(${yOffset}px)` : "translateY(100vh)",
                                    opacity: cardsDealt ? 1 : 0,
                                    zIndex: isSelected ? 10 : baseOffset,
                                    transitionDelay: cardsDealt ? "0ms" : `${dealDelay}ms`,
                                }}
                                onClick={handleClick}
                            >
                                <div
                                    className="rounded-2xl p-8 backdrop-blur-xl border-2 shadow-2xl"
                                    style={{
                                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                                        borderColor: feature.accentColor,
                                        boxShadow: isSelected ? `0 20px 60px ${feature.accentColor}40` : "0 4px 12px rgba(0, 0, 0, 0.3)",
                                    }}
                                >
                                    {/* Header Bar */}
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-3xl font-bold" style={{ color: feature.accentColor }}>
                                            {feature.title}
                                        </h2>
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center transition-transform"
                                            style={{ backgroundColor: feature.accentColor, transform: isSelected ? "rotate(180deg)" : "rotate(0deg)" }}
                                        >
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    {/* Content - Only show when selected */}
                                    {isSelected && (
                                        <ul className="space-y-3 animate-in slide-in-from-bottom-4 fade-in duration-500">
                                            {feature.items.map((item, itemIndex) => (
                                                <li key={itemIndex} className="flex items-start gap-3 text-lg text-white">
                                                    <span className="text-2xl" style={{ color: feature.accentColor }}>
                                                        •
                                                    </span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
