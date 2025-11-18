"use client";

import { type ReactNode } from "react";
import { Tag } from "@/src/components/ui/tag/tag";

const DURATION_COLOR_FILL = "#f59e0b";

interface EventDurationTagProps {
    icon: ReactNode;
    eventCount: number;
    duration: string;
}

export const EventDurationTag = ({ icon, eventCount, duration }: EventDurationTagProps) => {
    const displayText = `${eventCount} events • ${duration}`;

    return <Tag icon={icon} name={displayText} bgColor={`${DURATION_COLOR_FILL}20`} borderColorHex={DURATION_COLOR_FILL} color={DURATION_COLOR_FILL} />;
};
