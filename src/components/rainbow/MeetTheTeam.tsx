"use client";

import type { RainbowShade, EntityConfig } from "@/types/rainbow-types";
import { RAINBOW_ENTITIES, RAINBOW_COLORS } from "@/config/rainbow-entities";
import { RainbowIdentityCard } from "./RainbowIdentityCard";

interface MeetTheTeamProps {
    hoveredShade: RainbowShade | null;
}

// Sub-component: Team
const Team = () => {
    const uniqueShades = [...new Set(RAINBOW_ENTITIES.map((e) => e.shadeId))];

    return (
        <div className="max-w-7xl mx-auto px-6 mt-8">
            <div className="flex flex-wrap justify-center gap-4">
                {uniqueShades.map((shade) => {
                    const bgColor = RAINBOW_COLORS[shade].fill;
                    const entityName = RAINBOW_ENTITIES.find((e) => e.shadeId === shade)?.name || shade;
                    return (
                        <div key={shade} className="py-4 px-6 rounded-lg border-2 text-center transition-all" style={{ borderColor: bgColor }}>
                            <span className="text-white text-lg font-medium">{entityName}</span>
                        </div>
                    );
                })}
            </div>
            <div className="text-center mt-8">
                <span className="font-bold text-xl text-gray-400 italic">Think of each icon as a character, each with a specific role.</span>
            </div>
        </div>
    );
};

export const MeetTheTeam = ({ hoveredShade }: MeetTheTeamProps) => {
    let selectedEntity: EntityConfig | null = null;

    if (hoveredShade) {
        selectedEntity = RAINBOW_ENTITIES.find((entity) => entity.shadeId === hoveredShade) || null;
    }

    return (
        <div className="relative z-[2] py-16">
            {/* Rainbow Spotlight Effect */}
            <div
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 opacity-50 blur-3xl pointer-events-none z-[3]"
                style={{ background: "radial-gradient(ellipse at top, rgba(168, 85, 247, 0.5), rgba(59, 130, 246, 0.4), rgba(34, 197, 94, 0.4), rgba(234, 179, 8, 0.4), rgba(249, 115, 22, 0.4), rgba(239, 68, 68, 0.4), transparent 70%)" }}
            />

            {!selectedEntity && <h2 className="text-4xl md:text-5xl font-bold text-white text-center relative z-[4]">Meet the Team</h2>}
            {selectedEntity ? (
                <RainbowIdentityCard entity={selectedEntity} />
            ) : (
                <div
                    className="animate-in slide-in-from-bottom-8 fade-in duration-300"
                    style={{
                        animation: hoveredShade === null ? "slideUp 0.3s ease-out" : "slideDown 0.3s ease-out",
                    }}
                >
                    <Team />
                </div>
            )}
            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes slideDown {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                }
            `}</style>
        </div>
    );
};
