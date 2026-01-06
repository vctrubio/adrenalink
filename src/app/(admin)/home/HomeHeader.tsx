"use client";

import { SchoolAdranlinkConnectionHeader } from "@/src/components/school/SchoolAdranlinkConnectionHeader";
import FlagIcon from "@/public/appSvgs/FlagIcon";
import DurationIcon from "@/public/appSvgs/DurationIcon";
import HandshakeIcon from "@/public/appSvgs/HandshakeIcon";
import { TrendingUp } from "lucide-react";
import { getHMDuration } from "@/getters/duration-getter";
import { getCompactNumber } from "@/getters/integer-getter";
import type { SchoolCredentials } from "@/types/credentials";

interface HomeHeaderProps {
    school: SchoolCredentials;
    globalTotals: {
        events: number;
        duration: number;
        commissions: number;
        profit: number;
    };
}

export function HomeHeader({ school, globalTotals }: HomeHeaderProps) {
    return (
        <header className="pb-4">
            <SchoolAdranlinkConnectionHeader
                schoolName={school.name}
                username={school.username}
                country={school.country}
                timezone={school.timezone}
                currency={school.currency}
                titleSub="Home of Adrenaline Activity"
                description={
                    <>
                        Managing your Lessons{" "}
                        <span className="text-muted-foreground/40">
                            <span className="italic">with easy</span> synchronization.
                        </span>
                    </>
                }
                hideEventId={true}
                customBadges={
                    <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-4 text-[10px] font-bold text-primary shadow-sm">
                        <div className="flex items-center gap-1.5">
                            <FlagIcon size={14} />
                            <span className="tracking-wide">{globalTotals.events}</span>
                        </div>
                        <div className="w-px h-3 bg-primary/20" />
                        <div className="flex items-center gap-1.5">
                            <DurationIcon size={14} />
                            <span className="tracking-wide">{getHMDuration(globalTotals.duration)}</span>
                        </div>
                        <div className="w-px h-3 bg-primary/20" />
                        <div className="flex items-center gap-1.5">
                            <HandshakeIcon size={14} />
                            <span className="tracking-wide">{getCompactNumber(globalTotals.commissions)}</span>
                        </div>
                        <div className="w-px h-3 bg-primary/20" />
                        <div className="flex items-center gap-1.5">
                            <TrendingUp size={14} strokeWidth={3} />
                            <span className="tracking-tight">{getCompactNumber(globalTotals.profit)}</span>
                        </div>
                    </div>
                }
            />
        </header>
    );
}
