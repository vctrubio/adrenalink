"use client";

import { useState } from "react";
import { Rainbow, MeetTheTeam } from "@/src/components/rainbow";
import { BackgroundImage } from "@/src/components/BackgroundImage";
import { RAINBOW_ENTITIES } from "@/config/rainbow-entities";

export default function ManualPage() {
    const [hoveredShade, setHoveredShade] = useState<string | null>(null);

    console.log("RAINBOW_ENTITIES:", RAINBOW_ENTITIES);
    return (
        <div className="min-h-screen relative">
            <BackgroundImage
                src="/kritaps_ungurs_unplash/mountain.jpg"
                position="fixed"
                overlay="linear-gradient(to bottom, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 0.85) 100%)"
                priority
            />

            <section className="relative overflow-visible z-[2]">
                <Rainbow onShadeHover={setHoveredShade} hoveredShade={hoveredShade} />
            </section>

            <MeetTheTeam hoveredShade={hoveredShade} />
        </div>
    );
}
