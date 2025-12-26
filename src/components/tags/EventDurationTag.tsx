"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";

const DURATION_COLOR_FILL = "#f59e0b";

interface EventDurationTagProps {
    icon: ReactNode;
    eventCount?: number;
    duration: string;
    location?: string;
}

export const EventDurationTag = ({ icon, eventCount, duration, location }: EventDurationTagProps) => {
    if (location) {
        return (
            <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                    {icon}
                    <span>{location}</span>
                </div>
                <span className="text-sm font-bold text-foreground/80 mt-1 leading-none whitespace-nowrap">
                    +{duration}
                </span>
            </div>
        );
    }

    const displayText = eventCount ? `${eventCount} events • ${duration}` : duration;

    return <Tag icon={icon} name={displayText} bgColor={`${DURATION_COLOR_FILL}20`} borderColorHex={DURATION_COLOR_FILL} color={DURATION_COLOR_FILL} />;
};