"use client";

import { useState } from "react";
import { Rainbow, RainbowShade, MeetTheTeam } from "@/src/components/rainbow";

export default function ManualPage() {
    const [hoveredShade, setHoveredShade] = useState<RainbowShade | null>(null);
    return (
        <div className="min-h-screen relative">
            {/* Background Mountain Image - Fixed Position */}
            <div
                className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: "url(/kritaps_ungurs_unplash/mountain.jpg)",
                    backgroundSize: "100% 100%",
                    backgroundPosition: "0 0",
                    backgroundRepeat: "no-repeat",
                }}
            />

            {/* Gradient Overlay - Fixed */}
            <div
                className="fixed inset-0 z-[1] pointer-events-none"
                style={{
                    background: "linear-gradient(to bottom, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 0.85) 100%)",
                }}
            />

            <section className="relative overflow-visible z-[2]">
                <Rainbow onShadeHover={setHoveredShade} hoveredShade={hoveredShade} />
            </section>

            <MeetTheTeam hoveredShade={hoveredShade} />
        </div>
    );
}
