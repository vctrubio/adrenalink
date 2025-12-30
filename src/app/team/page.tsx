"use client";

import { useState } from "react";
import Image from "next/image";
import { RainbowV2, MeetTheTeamV2 } from "@/src/components/team";
import { BackgroundImage } from "@/src/components/BackgroundImage";
import IntoAdrBarShell from "@/src/components/IntoAdrBarShell";
import { TEAM_ENTITIES, TEAM_COLORS } from "@/config/team-entities";
import { ArrowRight } from "lucide-react";

export default function TeamPage() {
    const [hoveredShade, setHoveredShade] = useState<string | null>(null);
    const [entityHoveredShade, setEntityHoveredShade] = useState<string | null>(null);

    // Merge both hover states for rainbow highlighting
    const activeShade = hoveredShade || entityHoveredShade;

    // Find the selected entity based on activeShade
    const selectedEntity = activeShade ? TEAM_ENTITIES.find((entity) => entity.colorKey === activeShade) : null;
    const SelectedIcon = selectedEntity ? selectedEntity.icon : null;

    return (
        <div className="min-h-screen relative">
            <BackgroundImage
                src="/kritaps_ungurs_unplash/mountain.jpg"
                position="fixed"
                overlay="linear-gradient(to bottom, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 0.85) 100%)"
                priority
            />

            {/* IntoAdrBarShell with Adrenalink icon on left and selected entity icon or pricing arrow on right */}
            <IntoAdrBarShell
                onBarClick={!SelectedIcon ? "/team/pricing" : undefined}
                leftSlot={
                    <Image 
                        src="/ADR.webp" 
                        alt="Adrenalink" 
                        width={32} 
                        height={32} 
                        className="w-8 h-8 object-contain brightness-0 invert"
                    />
                }
                rightSlot={
                    SelectedIcon ? (
                        <SelectedIcon
                            className="w-7 h-7 transition-colors"
                            style={{ color: TEAM_COLORS[selectedEntity!.colorKey].fill }}
                        />
                    ) : (
                        <div className="flex items-center gap-2 text-white">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    )
                }
            />

            <section className="relative overflow-visible z-[2]">
                <RainbowV2 onShadeHover={setHoveredShade} hoveredShade={activeShade} />
            </section>

            <MeetTheTeamV2 hoveredShade={hoveredShade} onShadeHover={setEntityHoveredShade} />
        </div>
    );
}
