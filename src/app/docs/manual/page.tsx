"use client";

import { useState } from "react";
import { ENTITY_DATA } from "@/config/entities";
import { Rainbow, RainbowShade, ColorMapping } from "@/src/components/rainbow";

// Introduction sub-component
function Introduction() {
    const [showCrudTooltip, setShowCrudTooltip] = useState(false);

    return (
        <div className="space-y-8 text-white/90 text-lg leading-relaxed">
            {/* Section 1 */}
            <div className="pb-6 border-b border-white/20">
                <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl font-bold text-secondary">1.</span>
                    <div className="underline">Meet the Team.</div>
                    <div>
                        <span className="font-bold text-xl text-white italic">Think of each icon as a character</span>, each with a specific role.
                    </div>
                </div>

                {/* Entity Icons Grid */}
                <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mt-6">
                    {ENTITY_DATA.map((entity) => {
                        const IconComponent = entity.icon;
                        return (
                            <div key={entity.id} className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <IconComponent className={`w-10 h-10 ${entity.color}`} />
                                </div>
                                <span className="text-xs text-center text-white/80">{entity.name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section 2 */}
            <div className="pb-6 border-b border-white/20">
                <div className="flex items-start gap-3">
                    <span className="text-2xl font-bold text-secondary">2.</span>
                    <div>
                        This management app aims to quickly and efficiently{" "}
                        <span className="relative inline-block cursor-help font-semibold text-secondary underline decoration-dotted" onMouseEnter={() => setShowCrudTooltip(true)} onMouseLeave={() => setShowCrudTooltip(false)}>
                            CRUD
                            {showCrudTooltip && <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap backdrop-blur-sm">Create, Read, Update, Delete</span>}
                        </span>{" "}
                        lessons. A lesson consists of:
                        <ul className="mt-3 ml-6 space-y-2">
                            <li>a) Lesson - teacher student communication</li>
                            <li>b) Booking progress of student</li>
                            <li>c) Equipment tracking</li>
                            <li>d) Referrals - where each reservation was made</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Section 3 */}
            <div>
                <div className="flex items-start gap-3">
                    <span className="text-2xl font-bold text-secondary">3.</span>
                    <div>
                        All entities have respective tables, forms, and ID pages. For example: <code className="px-2 py-1 bg-black/40 rounded text-sm font-mono">students/id</code> or <code className="px-2 py-1 bg-black/40 rounded text-sm font-mono">students/form</code>{" "}
                        or <code className="px-2 py-1 bg-black/40 rounded text-sm font-mono">students</code> (the table route).
                    </div>
                </div>
            </div>
        </div>
    );
}

// Rainbow visualization sub-component
function RainbowVisualization() {
    const [hoveredShade, setHoveredShade] = useState<RainbowShade | null>(null);

    return (
        <div className="space-y-8">
            <Rainbow onShadeHover={setHoveredShade} hoveredShade={hoveredShade} />
            <ColorMapping hoveredShade={hoveredShade} onShadeHover={setHoveredShade} />
        </div>
    );
}

export default function ManualPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center py-12">
            {/* Background Mountain Image */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url(/kritaps_ungurs_unplash/mountain.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Gradient Overlay */}
            <div
                className="fixed inset-0 z-[1]"
                style={{
                    background: "linear-gradient(to bottom, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 0.85) 100%)",
                }}
            />

            {/* Content Card */}
            <div className="relative z-[2] p-8 rounded-lg border border-secondary/60 bg-card/80 backdrop-blur-md">
                <h1 className="text-4xl font-bold text-center text-white drop-shadow-lg mb-8">Manual</h1>
                <RainbowVisualization />
            </div>
        </div>
    );
}
