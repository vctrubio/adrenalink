"use client";

import { useState, useEffect } from "react";
import { TABLE_CONFIG } from "@/config/tables";
import { entityToRainbowColor } from "@/config/rainbow-mapping";
import { rainbowBaseColors } from "@/config/rainbow";
import { RainbowColor, RainbowShade, getBaseColor, getShadeColor } from "./Rainbow";

interface RainbowHoverProps {
    hoveredShade: RainbowShade | null;
}

interface MousePosition {
    x: number;
    y: number;
}

const colorLabels: Record<RainbowColor, { name: string; description: string }> = {
    purple: {
        name: "Equipment",
        description: "We add and track equipment activity throughout bookings.",
    },
    blue: {
        name: "Booking",
        description: "This is the base of the application. Everything in blue will relate to a booking, event, and lesson. More on that soon.",
    },
    green: {
        name: "Teacher",
        description: "Your teachers have commission based salaries. Either fixed per hour, or percentage per hour.",
    },
    yellow: {
        name: "Students",
        description: "Obviously this is clear. They register through your homepage, and can pick packages that are public.",
    },
    orange: {
        name: "Packages",
        description: "Where the math is done, you post your package (price, hours, capacity, equipment), and students make a request.",
    },
    red: {
        name: "Rentals",
        description: "Students that are independent can rent, we track equipment, duration and price of the event.",
    },
    grey: {
        name: "School",
        description: "This is your homebase, start by creating referral codes to know where each package request comes from. More on that here.",
    },
};

const getEntityRainbowShade = (entityId: string): RainbowShade | null => {
    return entityToRainbowColor[entityId] || null;
};

const RainbowTag = ({ entity, shade }: { entity: (typeof TABLE_CONFIG)[0]; shade: RainbowShade }) => {
    const shadeColor = getShadeColor(shade);

    return (
        <div
            className="flex items-center gap-2 px-3 py-1 rounded-md border-2 transition-all"
            style={{
                borderColor: shadeColor.fill,
                backgroundColor: "transparent",
            }}
        >
            <entity.icon className={`w-4 h-4 ${entity.color}`} />
            <span className="text-xs font-medium text-white">{entity.name}</span>
        </div>
    );
};

export const RainbowHover = ({ hoveredShade }: RainbowHoverProps) => {
    const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        if (hoveredShade) {
            window.addEventListener("mousemove", handleMouseMove);
            return () => window.removeEventListener("mousemove", handleMouseMove);
        }
    }, [hoveredShade]);

    if (!hoveredShade) return null;

    const baseColor = getBaseColor(hoveredShade);
    const colorLabel = colorLabels[baseColor];
    const bgColor = rainbowBaseColors[baseColor].fill;

    const entitiesForColor = TABLE_CONFIG.filter(entity => {
        const shade = getEntityRainbowShade(entity.id);
        return shade && getBaseColor(shade) === baseColor;
    });

    return (
        <div
            className="fixed z-50 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden shadow-2xl max-w-sm transition-transform duration-100 fade-in pointer-events-none"
            style={{
                background: "rgba(15, 23, 42, 0.95)",
                left: "0",
                top: "0",
                transform: `translate(${mousePos.x + 12}px, ${mousePos.y + 12}px)`,
            }}
        >
            {/* Head */}
            <div
                className="px-6 py-4 flex items-center gap-3 border-b border-white/10"
                style={{
                    background: `${bgColor}15`,
                }}
            >
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                        background: bgColor,
                    }}
                >
                    <div
                        className="w-6 h-6 rounded-full"
                        style={{
                            background: `${bgColor}40`,
                        }}
                    />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-white">{colorLabel.name}</h3>
                    <p className="text-xs text-white/60">{hoveredShade}</p>
                </div>
            </div>

            {/* Body */}
            <div className="px-6 py-4 border-b border-white/10">
                <p className="text-xs leading-relaxed text-white/80">{colorLabel.description}</p>
            </div>

            {/* Toes */}
            <div className="px-6 py-4 flex flex-wrap gap-2">
                {entitiesForColor.map((entity) => {
                    const shade = getEntityRainbowShade(entity.id);
                    return shade ? <RainbowTag key={entity.id} entity={entity} shade={shade} /> : null;
                })}
            </div>
        </div>
    );
};
